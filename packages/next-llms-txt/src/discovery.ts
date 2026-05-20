/* eslint-disable no-console */
import type { LLMsTxtConfig, LLMsTxtItem, RequiredLLMsTxtHandlerConfig } from './types.ts'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { DEFAULT_CONFIG } from './constants.js'
import stripJsonComments from './strip-json-comments.js'

/**
 * Information about a discovered page. Only `route` is required for
 * user-supplied entries via `LLMsTxtHandlerConfig.pages`; auto-discovery
 * fills in the rest.
 */
export interface PageInfo {
  route: string
  filePath?: string
  hasLLMsTxtExport?: boolean
  hasMetadataFallback?: boolean
  config?: LLMsTxtConfig
  warnings?: string[]
}

/**
 * TypeScript path alias mapping
 */
interface PathAlias {
  prefix: string
  replacement: string
}

/**
 * Auto-discovery system for Next.js pages and their llms.txt configurations
 */
export class LLMsTxtAutoDiscovery {
  /**
   * Handler configuration with all keys required
   */
  private config: RequiredLLMsTxtHandlerConfig
  private warnings: string[] = []
  private pathAliases: PathAlias[] = []

  constructor(config: RequiredLLMsTxtHandlerConfig) {
    this.config = config

    // Load TypeScript path aliases from tsconfig.json
    this.loadTsConfigPaths()
  }

  /**
   * Load TypeScript path aliases from tsconfig.json
   */
  private loadTsConfigPaths(): void {
    try {
      const autoDiscovery = this.config.autoDiscovery
      const configuredRoot = autoDiscovery ? autoDiscovery.rootDir : undefined
      const tsconfigPath = path.join(configuredRoot || process.cwd(), 'tsconfig.json')
      if (fs.existsSync(tsconfigPath)) {
        const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8')

        // Strip comments from JSONC
        const cleanedContent = stripJsonComments(tsconfigContent)

        const tsconfig = JSON.parse(cleanedContent)
        const compilerOptions = tsconfig.compilerOptions || {}
        const baseUrl = compilerOptions.baseUrl || '.'
        const paths = compilerOptions.paths || {}

        // Convert TypeScript paths to our internal format
        for (const [alias, targets] of Object.entries(paths)) {
          if (Array.isArray(targets) && targets.length > 0) {
            // Handle wildcards: "@/*" -> ["./src/*"]
            const cleanAlias = alias.replace(/\/\*$/, '')
            const target = targets[0].replace(/\/\*$/, '')

            this.pathAliases.push({
              prefix: cleanAlias,
              replacement: path.resolve(
                configuredRoot || process.cwd(),
                baseUrl,
                target,
              ),
            })
          }
        }

        if (this.pathAliases.length > 0 && this.config.showWarnings) {
          console.log('Loaded TypeScript path aliases:', this.pathAliases)
        }
      }
    }
    catch (error) {
      // Silently fail if we can't load tsconfig - not critical
      if (this.config.showWarnings) {
        console.warn('Failed to load tsconfig.json paths:', error)
      }
    }
  }

  /**
   * Discovers all pages and their llms.txt configurations across both the
   * App Router and the Pages Router.
   */
  async discoverPages(): Promise<PageInfo[]> {
    const pages: PageInfo[] = []
    const autoDiscovery = this.config.autoDiscovery
    if (!autoDiscovery)
      return pages

    // Resolve the root lazily: an unset rootDir falls back to the live
    // process.cwd() at request time rather than a value frozen at import.
    const rootDir = autoDiscovery.rootDir || process.cwd()
    const seen = new Set<string>()

    // Discover App Router pages
    if (autoDiscovery.appDir) {
      const appDir = path.join(rootDir, autoDiscovery.appDir)
      if (this.directoryExists(appDir)) {
        const appPages = await this.discoverAppPages(appDir)
        for (const p of appPages) {
          if (seen.has(p.route))
            continue
          seen.add(p.route)
          pages.push(p)
        }
      }
    }

    // Discover Pages Router pages (skipped for routes already handled by the
    // App Router; App Router wins per Next.js precedence).
    if (autoDiscovery.pagesDir) {
      const pagesDir = path.join(rootDir, autoDiscovery.pagesDir)
      if (this.directoryExists(pagesDir)) {
        const pagesRouterPages = await this.discoverPagesRouterPages(pagesDir)
        for (const p of pagesRouterPages) {
          if (seen.has(p.route))
            continue
          seen.add(p.route)
          pages.push(p)
        }
      }
    }

    return pages
  }

  /**
   * Generates site-wide llms.txt configuration from all discoverable pages.
   * Pages are bucketed into sections by their first path segment; root-level
   * pages (e.g. `/`, `/about`) are grouped under "Main Pages".
   */
  async generateSiteConfig(): Promise<LLMsTxtConfig> {
    const pages = await this.discoverPages()

    const sections = new Map<string, LLMsTxtItem[]>()

    for (const page of pages) {
      if (!page.config) {
        this.addWarning(
          `Page ${page.route} has no llms.txt configuration and will be excluded`,
          page,
        )
        continue
      }

      const item: LLMsTxtItem = {
        title: page.config.title,
        url: `${this.config.baseUrl}${page.route}`,
      }
      if (page.config.description !== undefined)
        item.description = page.config.description

      const sectionTitle = this.inferSectionTitle(page.route)
      if (!sections.has(sectionTitle))
        sections.set(sectionTitle, [])
      sections.get(sectionTitle)!.push(item)
    }

    return {
      title: this.config.defaultConfig?.title || DEFAULT_CONFIG.defaultConfig!.title,
      description: this.config.defaultConfig?.description || DEFAULT_CONFIG.defaultConfig!.description,
      sections: Array.from(sections.entries()).map(([title, items]) => ({ title, items })),
    }
  }

  /**
   * Derive a section title from a route. Root-level routes (no path segments
   * or a single segment) go under "Main Pages"; deeper routes use the first
   * path segment, title-cased (e.g. `/docs/foo` → `Docs`).
   */
  private inferSectionTitle(route: string): string {
    const segments = route.split('/').filter(Boolean)
    if (segments.length <= 1)
      return 'Main Pages'

    const first = segments[0]
    return first.charAt(0).toUpperCase() + first.slice(1)
  }

  /**
   * Discovers App Router pages (app directory). Recognises `page.tsx`,
   * `page.ts`, `page.jsx`, and `page.js` as valid page entry points.
   */
  private async discoverAppPages(appDir: string): Promise<PageInfo[]> {
    const pages: PageInfo[] = []
    const pageEntryNames = new Set([
      'page.tsx',
      'page.ts',
      'page.jsx',
      'page.js',
    ])

    const walkDir = (dir: string, routePrefix = ''): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          // Skip route groups and private folders
          if (entry.name.startsWith('(') || entry.name.startsWith('_')) {
            continue
          }

          const newRoute = path.posix.join(routePrefix, entry.name)
          walkDir(fullPath, newRoute)
        }
        else if (pageEntryNames.has(entry.name)) {
          const route = routePrefix || '/'
          const normalizedRoute = this.normalizeRoute(route)
          const pageInfo = this.analyzePage(fullPath, normalizedRoute)
          pages.push(pageInfo)
        }
      }
    }

    walkDir(appDir)
    return pages
  }

  /**
   * Discovers Pages Router pages (pages directory). Each `.ts(x)`/`.js(x)`
   * file (other than `_app`, `_document`, `_error`, `_middleware`, `_offline`,
   * `404`, `500`, anything else with a leading underscore, test/spec/stories
   * files, type-declaration files, and anything under `api/`) maps to a
   * route. `index.tsx` maps to its parent directory.
   */
  private async discoverPagesRouterPages(pagesDir: string): Promise<PageInfo[]> {
    const pages: PageInfo[] = []
    const pageExtensions = new Set(['.tsx', '.ts', '.jsx', '.js'])
    const reservedBasenames = new Set([
      '_app',
      '_document',
      '_error',
      '_middleware',
      '_offline',
      '404',
      '500',
    ])
    // Matches `*.test.*`, `*.spec.*`, `*.stories.*`, `*.d.ts`, `*.d.tsx`
    const nonPageFileRegex = /\.(?:test|spec|stories)\.[a-z]+$|\.d\.tsx?$/i

    const walkDir = (dir: string, routePrefix = ''): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          // Skip API routes and private folders
          if (entry.name === 'api' || entry.name.startsWith('_')) {
            continue
          }
          const newRoute = path.posix.join(routePrefix, entry.name)
          walkDir(fullPath, newRoute)
          continue
        }

        const ext = path.extname(entry.name)
        if (!pageExtensions.has(ext))
          continue

        // Skip test, spec, story, and type-declaration files
        if (nonPageFileRegex.test(entry.name))
          continue

        const basename = entry.name.slice(0, -ext.length)
        // Skip explicitly reserved basenames and any underscore-prefixed file
        if (reservedBasenames.has(basename) || basename.startsWith('_'))
          continue

        const route = basename === 'index'
          ? (routePrefix || '/')
          : path.posix.join(routePrefix, basename)
        const normalizedRoute = this.normalizeRoute(route)
        const pageInfo = this.analyzePage(fullPath, normalizedRoute)
        pages.push(pageInfo)
      }
    }

    walkDir(pagesDir)
    return pages
  }

  /**
   * Analyzes a page file for llms.txt exports and metadata
   */
  private analyzePage(filePath: string, route: string): PageInfo {
    const pageInfo: PageInfo = {
      route,
      filePath,
      hasLLMsTxtExport: false,
      hasMetadataFallback: false,
      warnings: [],
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      })

      let llmsTxtConfig: LLMsTxtConfig | undefined
      // Next.js `metadata.title` can be a plain string or an object such as
      // `{ default, template, absolute }`; we normalise it later before use.
      let metadataConfig: { title?: unknown, description?: unknown } | undefined

      traverse(ast, {
        ExportNamedDeclaration: (path) => {
          path.node.specifiers.forEach((specifier) => {
            if (t.isIdentifier(specifier.exported) && specifier.exported.name === 'llmstxt') {
              if (t.isExportSpecifier(specifier) && t.isIdentifier(specifier.local)) {
                const localName = specifier.local.name
                traverse(ast, {
                  VariableDeclaration: (varPath) => {
                    for (const declaration of varPath.node.declarations) {
                      if (t.isIdentifier(declaration.id) && declaration.id.name === localName) {
                        llmsTxtConfig = this.extractObjectExpression(declaration.init, ast, filePath)
                      }
                    }
                  },
                  ImportDeclaration: (importPath) => {
                    for (const importSpecifier of importPath.node.specifiers) {
                      if (t.isImportSpecifier(importSpecifier)
                        && t.isIdentifier(importSpecifier.local)
                        && importSpecifier.local.name === localName) {
                        llmsTxtConfig = this.extractObjectExpression(
                          t.identifier(localName),
                          ast,
                          filePath,
                        )
                      }
                    }
                  },
                })
              }
            }

            if (t.isIdentifier(specifier.exported) && specifier.exported.name === 'metadata') {
              if (t.isExportSpecifier(specifier) && t.isIdentifier(specifier.local)) {
                const localName = specifier.local.name
                traverse(ast, {
                  VariableDeclaration: (varPath) => {
                    for (const declaration of varPath.node.declarations) {
                      if (t.isIdentifier(declaration.id) && declaration.id.name === localName) {
                        metadataConfig = this.extractObjectExpression(declaration.init, ast, filePath)
                      }
                    }
                  },
                  ImportDeclaration: (importPath) => {
                    for (const importSpecifier of importPath.node.specifiers) {
                      if (t.isImportSpecifier(importSpecifier)
                        && t.isIdentifier(importSpecifier.local)
                        && importSpecifier.local.name === localName) {
                        metadataConfig = this.extractObjectExpression(
                          t.identifier(localName),
                          ast,
                          filePath,
                        )
                      }
                    }
                  },
                })
              }
            }
          })

          if (path.node.declaration && t.isVariableDeclaration(path.node.declaration)) {
            path.node.declaration.declarations.forEach((declaration) => {
              if (t.isIdentifier(declaration.id) && declaration.id.name === 'llmstxt') {
                llmsTxtConfig = this.extractObjectExpression(declaration.init, ast, filePath)
              }
              if (t.isIdentifier(declaration.id) && declaration.id.name === 'metadata') {
                metadataConfig = this.extractObjectExpression(declaration.init, ast, filePath)
              }
            })
          }
        },
      })

      if (llmsTxtConfig) {
        pageInfo.hasLLMsTxtExport = true
        pageInfo.config = llmsTxtConfig
      }
      else if (metadataConfig) {
        pageInfo.hasMetadataFallback = true
        const normalisedTitle = this.coerceMetadataTitle(metadataConfig.title)
        pageInfo.config = {
          title: normalisedTitle || this.generatePageTitle(route),
          description: typeof metadataConfig.description === 'string'
            ? metadataConfig.description
            : `Page: ${route}`,
        }
        this.addWarning(
          'Using metadata fallback for llms.txt generation - consider adding explicit llmstxt export',
          pageInfo,
        )
      }
      else {
        this.addWarning(
          'No llms.txt export or metadata found - cannot generate llms.txt entry',
          pageInfo,
        )
      }
    }
    catch (error) {
      this.addWarning(`Failed to analyze page: ${error}`, pageInfo)
    }

    return pageInfo
  }

  /**
   * Public method to extract object expression (for testing)
   * Handles identifiers, re-exports, and TypeScript path aliases
   */
  public extractObjectExpression(
    node: t.Expression | null | undefined,
    ast: t.File,
    currentFilePath: string,
  ) {
    // Case 1: Direct object expression
    if (t.isObjectExpression(node)) {
      const obj: { [key: string]: any } = {}
      for (const prop of node.properties) {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const key = prop.key.name
          const value = prop.value

          if (t.isStringLiteral(value)) {
            obj[key] = value.value
          }
          else if (t.isTemplateLiteral(value)) {
            obj[key] = value.quasis.map(q => q.value.raw).join('')
          }
          else if (t.isNumericLiteral(value)) {
            obj[key] = value.value
          }
          else if (t.isBooleanLiteral(value)) {
            obj[key] = value.value
          }
          else if (t.isArrayExpression(value)) {
            obj[key] = value.elements.map((el) => {
              if (t.isObjectExpression(el)) {
                return this.extractObjectExpression(el, ast, currentFilePath)
              }
              else if (t.isStringLiteral(el)) {
                return el.value
              }
              else if (t.isNumericLiteral(el)) {
                return el.value
              }
              else if (t.isBooleanLiteral(el)) {
                return el.value
              }
              else if (el == null) {
                return null
              }
              else {
                // For nested arrays or other types
                return el
              }
            })
          }
          else if (t.isObjectExpression(value)) {
            obj[key] = this.extractObjectExpression(value, ast, currentFilePath)
          }
        }
      }

      return obj
    }

    // Case 2: Identifier reference
    if (t.isIdentifier(node)) {
      if (this.config.showWarnings) {
        console.log('Node is an identifier:', node.name)
      }

      let resolvedValue: any
      // Important, use arrow funcs because of 'this'
      traverse(ast, {
        ImportDeclaration: (path) => {
          const importPath = path.node
          for (const specifier of importPath.specifiers) {
            if (t.isImportSpecifier(specifier)
              && t.isIdentifier(specifier.local)
              && specifier.local.name === node.name) {
              const importSource = importPath.source.value
              const resolvedPath = this.resolveImportPath(currentFilePath, importSource)

              if (resolvedPath && fs.existsSync(resolvedPath)) {
                try {
                  const importedContent = fs.readFileSync(resolvedPath, 'utf-8')
                  const importedAst = parse(importedContent, {
                    sourceType: 'module',
                    plugins: ['typescript', 'jsx'],
                  })

                  const importedName = t.isIdentifier(specifier.imported)
                    ? specifier.imported.name
                    : node.name

                  resolvedValue = this.findExportedValue(importedAst, importedName, resolvedPath)
                }
                catch (err) {
                  if (this.config.showWarnings) {
                    console.warn('Failed to read imported file:', resolvedPath, err)
                  }
                }
              }
            }

            if (t.isImportDefaultSpecifier(specifier)
              && t.isIdentifier(specifier.local)
              && specifier.local.name === node.name) {
              const importSource = importPath.source.value
              const resolvedPath = this.resolveImportPath(currentFilePath, importSource)

              if (resolvedPath && fs.existsSync(resolvedPath)) {
                try {
                  const importedContent = fs.readFileSync(resolvedPath, 'utf-8')
                  const importedAst = parse(importedContent, {
                    sourceType: 'module',
                    plugins: ['typescript', 'jsx'],
                  })

                  resolvedValue = this.findDefaultExport(importedAst, resolvedPath)
                }
                catch (err) {
                  if (this.config.showWarnings) {
                    console.warn('Failed to read imported file:', resolvedPath, err)
                  }
                }
              }
            }
          }
        },

        VariableDeclaration: (path) => {
          for (const declaration of path.node.declarations) {
            if (t.isIdentifier(declaration.id) && declaration.id.name === node.name) {
              if (declaration.init) {
                resolvedValue = this.extractObjectExpression(declaration.init, ast, currentFilePath)
              }
            }
          }
        },
      })

      return resolvedValue
    }

    return undefined
  }

  /**
   * Helper function to resolve import paths (including TypeScript aliases)
   */
  private resolveImportPath(currentFilePath: string, importSource: string): string | null {
    if (this.config.showWarnings) {
      console.log(`Resolving import: ${importSource} from ${currentFilePath}`)
    }

    // Check if this is a TypeScript path alias
    for (const alias of this.pathAliases) {
      if (importSource.startsWith(alias.prefix)) {
        // Replace the alias prefix with the actual path
        const relativePath = importSource.substring(alias.prefix.length)
        const resolvedPath = path.join(alias.replacement, relativePath)

        if (this.config.showWarnings) {
          console.log(`Resolved alias ${alias.prefix} to: ${resolvedPath}`)
        }

        // Try different extensions
        const result = this.tryResolveWithExtensions(resolvedPath)
        if (result) {
          return result
        }
      }
    }

    // Handle relative imports
    if (importSource.startsWith('.')) {
      const currentDir = path.dirname(currentFilePath)
      const resolvedPath = path.resolve(currentDir, importSource)
      return this.tryResolveWithExtensions(resolvedPath)
    }

    // Node modules or other non-resolvable paths
    return null
  }

  /**
   * Try to resolve a path with different extensions
   */
  private tryResolveWithExtensions(resolvedPath: string): string | null {
    const extensions = ['.ts', '.tsx', '.js', '.jsx']

    // If path already has extension and exists
    if (fs.existsSync(resolvedPath)) {
      return resolvedPath
    }

    // Try adding extensions
    for (const ext of extensions) {
      const pathWithExt = resolvedPath + ext
      if (fs.existsSync(pathWithExt)) {
        if (this.config.showWarnings) {
          console.log(`Resolved to: ${pathWithExt}`)
        }
        return pathWithExt
      }
    }

    // Try index files
    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, `index${ext}`)
      if (fs.existsSync(indexPath)) {
        if (this.config.showWarnings) {
          console.log(`Resolved to index: ${indexPath}`)
        }
        return indexPath
      }
    }

    return null
  }

  /**
   * Helper function to find exported value by name
   */
  private findExportedValue(ast: t.File, exportName: string, filePath: string): any {
    let result: any

    traverse(ast, {
      ExportNamedDeclaration: (path) => {
        if (path.node.declaration && t.isVariableDeclaration(path.node.declaration)) {
          for (const declaration of path.node.declaration.declarations) {
            if (t.isIdentifier(declaration.id) && declaration.id.name === exportName) {
              if (t.isObjectExpression(declaration.init)) {
                result = this.extractObjectExpression(declaration.init, ast, filePath)
              }
            }
          }
        }

        // Handle re-exports: export { LLMSTXT }
        for (const specifier of path.node.specifiers) {
          if (t.isExportSpecifier(specifier)) {
            const exported = t.isIdentifier(specifier.exported)
              ? specifier.exported.name
              : specifier.exported.value
            const local = t.isIdentifier(specifier.local)
              ? specifier.local.name
              // @ts-expect-error - FIXME: Babel types missing 'value'?
              : specifier.local.value

            if (exported === exportName) {
              // Now find the local variable
              traverse(ast, {
                VariableDeclaration: (varPath) => {
                  for (const declaration of varPath.node.declarations) {
                    if (t.isIdentifier(declaration.id) && declaration.id.name === local) {
                      if (t.isObjectExpression(declaration.init)) {
                        result = this.extractObjectExpression(declaration.init, ast, filePath)
                      }
                    }
                  }
                },
              })
            }
          }
        }
      },
    })

    return result
  }

  /**
   * Helper function to find default export
   */
  private findDefaultExport(ast: t.File, filePath: string): any {
    let result: any

    traverse(ast, {
      ExportDefaultDeclaration: (path) => {
        if (t.isObjectExpression(path.node.declaration)) {
          result = this.extractObjectExpression(path.node.declaration, ast, filePath)
        }
        else if (t.isIdentifier(path.node.declaration)) {
          const identifierName = path.node.declaration.name
          traverse(ast, {
            VariableDeclaration: (varPath) => {
              for (const declaration of varPath.node.declarations) {
                if (t.isIdentifier(declaration.id) && declaration.id.name === identifierName) {
                  if (t.isObjectExpression(declaration.init)) {
                    result = this.extractObjectExpression(declaration.init, ast, filePath)
                  }
                }
              }
            },
          })
        }
      },
    })

    return result
  }

  /**
   * Utility methods
   */
  private directoryExists(dir: string): boolean {
    try {
      return fs.statSync(dir).isDirectory()
    }
    catch {
      return false
    }
  }

  private normalizeRoute(route: string): string {
    if (!route.startsWith('/')) {
      route = `/${route}`
    }

    route = route.replace(/\\/g, '/')

    if (route.length > 1 && route.endsWith('/')) {
      route = route.slice(0, -1)
    }

    return route
  }

  /**
   * Normalise Next.js's `metadata.title`, which may be a plain string or an
   * object such as `{ default, template, absolute }`, into a single string.
   * Returns an empty string when no usable value can be extracted.
   */
  private coerceMetadataTitle(raw: unknown): string {
    if (typeof raw === 'string')
      return raw
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>
      if (typeof obj.absolute === 'string')
        return obj.absolute
      if (typeof obj.default === 'string')
        return obj.default
    }
    return ''
  }

  private generatePageTitle(route: string): string {
    if (route === '/')
      return 'Home'

    return route
      .split('/')
      .filter(Boolean)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' - ')
  }

  private addWarning(message: string, pageInfo: PageInfo): void {
    const warning = `[next-llms-txt] ${message} (${pageInfo.route})`
    if (!pageInfo.warnings)
      pageInfo.warnings = []
    pageInfo.warnings.push(warning)
    this.warnings.push(warning)

    if (this.config.showWarnings) {
      console.warn(warning)
    }
  }

  /**
   * Get all warnings generated during discovery
   */
  getWarnings(): string[] {
    return [...this.warnings]
  }
}
