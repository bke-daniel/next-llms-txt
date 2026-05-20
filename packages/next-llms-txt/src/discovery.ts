import type { LLMsTxtConfig, LLMsTxtItem, RequiredLLMsTxtHandlerConfig } from './types.ts'
import { promises as fsp } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import debug from 'debug'
import { DEFAULT_CONFIG, DEFAULT_PAGE_EXTENSIONS } from './constants.js'
import normalizePath from './normalize-path.js'
import stripJsonComments from './strip-json-comments.js'

// Trace-level diagnostics — opt in via `DEBUG=next-llms-txt:discovery` or
// `DEBUG=next-llms-txt:*` in the environment.
const log = debug('next-llms-txt:discovery')

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
 * Per-file index of named variable declarations and imports — built once
 * per AST so identifier resolution is O(1) lookup instead of repeated
 * full-AST traversals (which was the O(n²) cost the audit flagged).
 */
interface FileIndex {
  /** Variable declarations indexed by binding name */
  declarations: Map<string, t.Expression | null | undefined>
  /** Named imports indexed by local-binding name */
  imports: Map<string, { source: string, importedName: string, isDefault: boolean }>
  /** Exports indexed by exported name (specifier `exported`) */
  namedExports: Map<string, { localName: string }>
  /** Direct `export const foo = { ... }` indexed by name */
  directExports: Map<string, t.Expression | null | undefined>
  /** `export default <expr>` */
  defaultExport?: t.Expression | t.Identifier | null
}

/**
 * Throws an `AbortError`-style DOMException if the signal has fired, so
 * deeply-nested async walks bail out promptly when a request is cancelled.
 */
function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    const err = signal.reason instanceof Error
      ? signal.reason
      : new DOMException('Discovery aborted', 'AbortError')
    throw err
  }
}

/**
 * Auto-discovery system for Next.js pages and their llms.txt configurations.
 *
 * Designed so that consumer code can construct one instance per handler
 * factory and reuse it across requests — the tsconfig path-alias load and
 * the per-file parsed-AST cache are populated lazily and persist for the
 * instance's lifetime.
 */
export class LLMsTxtAutoDiscovery {
  private config: RequiredLLMsTxtHandlerConfig
  private warnings: string[] = []
  private pathAliases: PathAlias[] = []
  /** Lazy initialiser promise for `loadTsConfigPaths`; resolves once. */
  private tsconfigLoadOnce: Promise<void> | null = null
  /** Cache of parsed ASTs keyed by canonical (realpath-resolved) file path. */
  private astCache: Map<string, t.File> = new Map()
  /** Index cache parallel to astCache. */
  private indexCache: Map<string, FileIndex> = new Map()

  constructor(config: RequiredLLMsTxtHandlerConfig) {
    this.config = config
    // NB: do NOT do sync fs in the constructor. tsconfig is loaded lazily
    // on first discoverPages() so module imports stay cheap and so factory
    // construction never blocks on disk I/O.
  }

  /**
   * Discovers all pages and their llms.txt configurations across both the
   * App Router and the Pages Router.
   *
   * Accepts an optional `AbortSignal` (typically the request's `signal`).
   * When fired, the walk bails out as soon as the current async hop
   * completes.
   */
  async discoverPages(signal?: AbortSignal): Promise<PageInfo[]> {
    throwIfAborted(signal)

    const pages: PageInfo[] = []
    const autoDiscovery = this.config.autoDiscovery
    if (!autoDiscovery)
      return pages

    await this.ensureTsConfigLoaded()
    throwIfAborted(signal)

    // Resolve the root lazily: an unset rootDir falls back to the live
    // process.cwd() at request time rather than a value frozen at import.
    const rootDir = autoDiscovery.rootDir || process.cwd()
    const seen = new Set<string>()
    // Track visited real paths so symlink cycles can't deadlock the walk.
    const visitedRealDirs = new Set<string>()

    if (autoDiscovery.appDir) {
      const appDir = path.join(rootDir, autoDiscovery.appDir)
      if (await this.directoryExists(appDir)) {
        const appPages = await this.discoverAppPages(appDir, visitedRealDirs, signal)
        for (const p of appPages) {
          if (seen.has(p.route))
            continue
          seen.add(p.route)
          pages.push(p)
        }
      }
    }

    if (autoDiscovery.pagesDir) {
      const pagesDir = path.join(rootDir, autoDiscovery.pagesDir)
      if (await this.directoryExists(pagesDir)) {
        const pagesRouterPages = await this.discoverPagesRouterPages(pagesDir, visitedRealDirs, signal)
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
  async generateSiteConfig(signal?: AbortSignal): Promise<LLMsTxtConfig> {
    const pages = await this.discoverPages(signal)

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

  // ───────────────────────────────────────────────────────────────────────
  // tsconfig path-alias load (lazy, run-once-per-instance)
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Memoised entry point: the underlying load runs exactly once per
   * instance, no matter how many concurrent `discoverPages` calls land.
   */
  private ensureTsConfigLoaded(): Promise<void> {
    if (!this.tsconfigLoadOnce)
      this.tsconfigLoadOnce = this.loadTsConfigPaths()
    return this.tsconfigLoadOnce
  }

  private async loadTsConfigPaths(): Promise<void> {
    try {
      const autoDiscovery = this.config.autoDiscovery
      const configuredRoot = autoDiscovery ? autoDiscovery.rootDir : undefined
      const tsconfigPath = path.join(configuredRoot || process.cwd(), 'tsconfig.json')

      let tsconfigContent: string
      try {
        tsconfigContent = await fsp.readFile(tsconfigPath, 'utf-8')
      }
      catch {
        return // No tsconfig — that's fine, just skip aliases.
      }

      const cleanedContent = stripJsonComments(tsconfigContent)
      let tsconfig: { compilerOptions?: { baseUrl?: string, paths?: Record<string, string[]> } }
      try {
        tsconfig = JSON.parse(cleanedContent)
      }
      catch (parseError) {
        // Wrap the JSON.parse error with the file path so misconfigured
        // tsconfig.json failures are debuggable instead of being a bare
        // SyntaxError that doesn't say which file.
        throw new Error(
          `Failed to parse tsconfig.json at ${tsconfigPath}: ${(parseError as Error).message}`,
          { cause: parseError },
        )
      }
      const compilerOptions = tsconfig.compilerOptions || {}
      const baseUrl = compilerOptions.baseUrl || '.'
      const paths = compilerOptions.paths || {}

      for (const [alias, targets] of Object.entries(paths)) {
        if (Array.isArray(targets) && targets.length > 0) {
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

      if (this.pathAliases.length > 0)
        log('Loaded TypeScript path aliases: %O', this.pathAliases)
    }
    catch (error) {
      // tsconfig parse failure is non-fatal — discovery just can't follow
      // aliased imports for this run.
      log('Failed to load tsconfig.json paths: %O', error)
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // Directory walking — async fs, symlink-cycle aware
  // ───────────────────────────────────────────────────────────────────────

  /**
   * App Router walker. Recognises `page.{tsx,ts,jsx,js}` as page entries.
   * Skips route groups (`(marketing)`), private folders (`_private`), and
   * already-visited real paths to avoid symlink loops.
   */
  private async discoverAppPages(
    appDir: string,
    visitedRealDirs: Set<string> = new Set(),
    signal?: AbortSignal,
  ): Promise<PageInfo[]> {
    const pages: PageInfo[] = []
    const pageEntryNames = new Set(this.getConfiguredExtensions().map(ext => `page${ext}`))

    const walkDir = async (dir: string, routePrefix: string): Promise<void> => {
      throwIfAborted(signal)

      // Symlink-cycle detection: resolve real path and short-circuit if
      // already walked. Falls back to `dir` if realpath fails.
      let real: string
      try {
        real = await fsp.realpath(dir)
      }
      catch {
        real = dir
      }
      if (visitedRealDirs.has(real))
        return
      visitedRealDirs.add(real)

      const entries = await fsp.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        throwIfAborted(signal)
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          if (entry.name.startsWith('(') || entry.name.startsWith('_'))
            continue
          const newRoute = path.posix.join(routePrefix, entry.name)
          await walkDir(fullPath, newRoute)
        }
        else if (pageEntryNames.has(entry.name)) {
          const route = routePrefix || '/'
          const normalizedRoute = this.normalizeRoute(route)
          const pageInfo = await this.analyzePage(fullPath, normalizedRoute)
          pages.push(pageInfo)
        }
      }
    }

    await walkDir(appDir, '')
    return pages
  }

  /**
   * Pages Router walker. Maps each non-reserved `.ts(x)`/`.js(x)` file to a
   * route. Skips `_app`/`_document`/`_error`/`_middleware`/`_offline`/
   * `404`/`500`, any underscore-prefixed file, the `api/` directory, and
   * `*.test.*` / `*.spec.*` / `*.stories.*` / `*.d.ts` companions.
   * `index.tsx` collapses to its parent directory.
   */
  private async discoverPagesRouterPages(
    pagesDir: string,
    visitedRealDirs: Set<string> = new Set(),
    signal?: AbortSignal,
  ): Promise<PageInfo[]> {
    const pages: PageInfo[] = []
    const pageExtensions = new Set(this.getConfiguredExtensions())
    const reservedBasenames = new Set([
      '_app',
      '_document',
      '_error',
      '_middleware',
      '_offline',
      '404',
      '500',
    ])
    const nonPageFileRegex = /\.(?:test|spec|stories)\.[a-z]+$|\.d\.tsx?$/i

    const walkDir = async (dir: string, routePrefix: string): Promise<void> => {
      throwIfAborted(signal)
      let real: string
      try {
        real = await fsp.realpath(dir)
      }
      catch {
        real = dir
      }
      if (visitedRealDirs.has(real))
        return
      visitedRealDirs.add(real)

      const entries = await fsp.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        throwIfAborted(signal)
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          if (entry.name === 'api' || entry.name.startsWith('_'))
            continue
          const newRoute = path.posix.join(routePrefix, entry.name)
          await walkDir(fullPath, newRoute)
          continue
        }

        const ext = path.extname(entry.name)
        if (!pageExtensions.has(ext))
          continue
        if (nonPageFileRegex.test(entry.name))
          continue

        const basename = entry.name.slice(0, -ext.length)
        if (reservedBasenames.has(basename) || basename.startsWith('_'))
          continue

        const route = basename === 'index'
          ? (routePrefix || '/')
          : path.posix.join(routePrefix, basename)
        const normalizedRoute = this.normalizeRoute(route)
        const pageInfo = await this.analyzePage(fullPath, normalizedRoute)
        pages.push(pageInfo)
      }
    }

    await walkDir(pagesDir, '')
    return pages
  }

  // ───────────────────────────────────────────────────────────────────────
  // Per-page analysis — async, single-traverse, AST-cached
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Read + parse + analyse a single page file, extracting either its
   * `llmstxt` export (preferred) or its `metadata` export (fallback).
   */
  private async analyzePage(filePath: string, route: string): Promise<PageInfo> {
    const pageInfo: PageInfo = {
      route,
      filePath,
      hasLLMsTxtExport: false,
      hasMetadataFallback: false,
      warnings: [],
    }

    try {
      const ast = await this.parseFileCached(filePath)
      const index = this.indexFile(ast, filePath)

      const llmsTxtConfig = await this.resolveExportByName(index, ast, filePath, this.getLLMsTxtExportName())
      const metadataConfig = await this.resolveExportByName(index, ast, filePath, 'metadata')

      if (llmsTxtConfig) {
        pageInfo.hasLLMsTxtExport = true
        pageInfo.config = llmsTxtConfig as LLMsTxtConfig
      }
      else if (metadataConfig) {
        pageInfo.hasMetadataFallback = true
        const md = metadataConfig as { title?: unknown, description?: unknown }
        const normalisedTitle = this.coerceMetadataTitle(md.title)
        pageInfo.config = {
          title: normalisedTitle || this.generatePageTitle(route),
          description: typeof md.description === 'string'
            ? md.description
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
   * Parse the file at `filePath` and memoise the resulting AST so that
   * importing the same config from multiple pages doesn't repeatedly re-
   * parse it. Keyed on the realpath of the file so two different symlinks
   * to the same module hit the same cache entry.
   */
  private async parseFileCached(filePath: string): Promise<t.File> {
    let key = filePath
    try {
      key = await fsp.realpath(filePath)
    }
    catch {
      // Use the supplied path if realpath fails (e.g. missing file — the
      // subsequent readFile will throw a more informative error).
    }
    const cached = this.astCache.get(key)
    if (cached)
      return cached

    const content = await fsp.readFile(key, 'utf-8')
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
    this.astCache.set(key, ast)
    return ast
  }

  /**
   * Walk the AST exactly once and build maps from binding-name → AST node.
   * Downstream identifier resolution then does cheap Map lookups instead
   * of issuing nested `traverse()` calls per export specifier (which was
   * the O(n²) AST scan the audit flagged).
   */
  private indexFile(ast: t.File, filePath: string): FileIndex {
    const cached = this.indexCache.get(filePath)
    if (cached)
      return cached

    const declarations = new Map<string, t.Expression | null | undefined>()
    const imports = new Map<string, { source: string, importedName: string, isDefault: boolean }>()
    const namedExports = new Map<string, { localName: string }>()
    const directExports = new Map<string, t.Expression | null | undefined>()
    let defaultExport: t.Expression | t.Identifier | null | undefined

    traverse(ast, {
      VariableDeclaration: (p) => {
        for (const decl of p.node.declarations) {
          if (t.isIdentifier(decl.id))
            declarations.set(decl.id.name, decl.init)
        }
      },
      ImportDeclaration: (p) => {
        const source = p.node.source.value
        for (const specifier of p.node.specifiers) {
          if (t.isImportSpecifier(specifier) && t.isIdentifier(specifier.local)) {
            const localName = specifier.local.name
            const importedName = t.isIdentifier(specifier.imported)
              ? specifier.imported.name
              : localName
            imports.set(localName, { source, importedName, isDefault: false })
          }
          else if (t.isImportDefaultSpecifier(specifier) && t.isIdentifier(specifier.local)) {
            imports.set(specifier.local.name, { source, importedName: 'default', isDefault: true })
          }
        }
      },
      ExportNamedDeclaration: (p) => {
        // export const foo = { ... }
        if (p.node.declaration && t.isVariableDeclaration(p.node.declaration)) {
          for (const decl of p.node.declaration.declarations) {
            if (t.isIdentifier(decl.id))
              directExports.set(decl.id.name, decl.init)
          }
        }
        // `export { foo } from '…'` — single-source re-exports. Treat the
        // local name as a synthetic import so the cross-file resolver can
        // follow it just like an explicit `import {…} from`.
        const reexportSource = p.node.source ? p.node.source.value : null
        for (const specifier of p.node.specifiers) {
          if (t.isExportSpecifier(specifier)) {
            const exportedName = t.isIdentifier(specifier.exported)
              ? specifier.exported.name
              : specifier.exported.value
            const localName = specifier.local.name
            namedExports.set(exportedName, { localName })
            if (reexportSource && !imports.has(localName)) {
              imports.set(localName, {
                source: reexportSource,
                importedName: localName,
                isDefault: false,
              })
            }
          }
        }
      },
      ExportDefaultDeclaration: (p) => {
        const decl = p.node.declaration
        if (t.isObjectExpression(decl) || t.isIdentifier(decl))
          defaultExport = decl
      },
    })

    const index: FileIndex = { declarations, imports, namedExports, directExports, defaultExport: defaultExport ?? null }
    this.indexCache.set(filePath, index)
    return index
  }

  /**
   * Resolve a named export (`llmstxt`, `metadata`, …) from a parsed file's
   * pre-built index, recursing through aliased re-exports and following
   * imports across files when necessary.
   */
  private async resolveExportByName(
    index: FileIndex,
    ast: t.File,
    currentFilePath: string,
    exportName: string,
  ): Promise<unknown> {
    // Form 1: `export const exportName = { ... }` — direct AST node lookup.
    if (index.directExports.has(exportName)) {
      const init = index.directExports.get(exportName)
      // `export const llmstxt = someImportedBinding` — chase the import.
      if (init && t.isIdentifier(init) && index.imports.has(init.name))
        return this.resolveImportedBinding(init.name, index, currentFilePath)
      return this.extractObjectExpression(init, ast, currentFilePath)
    }

    // Form 2: `export { foo as exportName }` or `export { exportName }`.
    const specifier = index.namedExports.get(exportName)
    if (specifier) {
      // 2a: the local binding may be a top-level VariableDeclaration in
      // this same file.
      if (index.declarations.has(specifier.localName)) {
        return this.extractObjectExpression(
          index.declarations.get(specifier.localName),
          ast,
          currentFilePath,
        )
      }
      // 2b: the local binding may be an import from another file — resolve
      // it across files.
      if (index.imports.has(specifier.localName))
        return this.resolveImportedBinding(specifier.localName, index, currentFilePath)
    }

    // Form 3: the export name itself matches an import binding (e.g.
    // `import { llmstxt } from '...'; export { llmstxt }`).
    if (index.imports.has(exportName))
      return this.resolveImportedBinding(exportName, index, currentFilePath)

    return undefined
  }

  /**
   * Follow `localName` through the file's import map to its source module,
   * parse that module via the cache, and extract the corresponding
   * exported value. Pure async helper used only when cross-file resolution
   * is actually needed — the pure-AST cases never touch the filesystem.
   */
  private async resolveImportedBinding(
    localName: string,
    index: FileIndex,
    currentFilePath: string,
  ): Promise<unknown> {
    const importRef = index.imports.get(localName)
    if (!importRef)
      return undefined

    const resolvedPath = await this.resolveImportPath(currentFilePath, importRef.source)
    if (!resolvedPath)
      return undefined

    let importedAst: t.File
    try {
      importedAst = await this.parseFileCached(resolvedPath)
    }
    catch (err) {
      log('Failed to parse imported file %s: %O', resolvedPath, err)
      return undefined
    }

    const importedIndex = this.indexFile(importedAst, resolvedPath)
    return importRef.isDefault
      ? this.resolveDefaultExport(importedIndex, importedAst, resolvedPath)
      : this.resolveExportByName(importedIndex, importedAst, resolvedPath, importRef.importedName)
  }

  /**
   * Resolve `export default <expr>` through the pre-built index.
   */
  private resolveDefaultExport(
    index: FileIndex,
    ast: t.File,
    filePath: string,
  ): unknown {
    const decl = index.defaultExport
    if (!decl)
      return undefined
    if (t.isObjectExpression(decl))
      return this.extractObjectExpression(decl, ast, filePath)
    if (t.isIdentifier(decl) && index.declarations.has(decl.name))
      return this.extractObjectExpression(index.declarations.get(decl.name), ast, filePath)
    return undefined
  }

  // ───────────────────────────────────────────────────────────────────────
  // Public synchronous extractor (kept for backward-compat with tests that
  // construct an AST themselves and want a pure-data extraction without
  // any cross-file work).
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Pure-AST object extraction. Synchronous — only handles literals,
   * nested objects, arrays, and local-variable identifier references. For
   * cross-file resolution use the internal async helpers, which `analyzePage`
   * wires up automatically.
   */
  public extractObjectExpression(
    node: t.Expression | null | undefined,
    ast: t.File,
    currentFilePath: string,
  ): unknown {
    if (t.isObjectExpression(node)) {
      const obj: Record<string, unknown> = {}
      for (const prop of node.properties) {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const key = prop.key.name
          const value = prop.value

          if (t.isStringLiteral(value)) {
            obj[key] = value.value
          }
          else if (t.isTemplateLiteral(value)) {
            // Preserve interpolations as visible placeholders so a title
            // like `Page ${id}` becomes `Page ${id}` in the output rather
            // than `Page ` with the substitution dropped.
            obj[key] = value.quasis.map((q, i) => {
              const placeholder = i < value.expressions.length
                ? `\${${this.describeTemplateExpression(value.expressions[i])}}`
                : ''
              return q.value.raw + placeholder
            }).join('')
          }
          else if (t.isNumericLiteral(value)) {
            obj[key] = value.value
          }
          else if (t.isBooleanLiteral(value)) {
            obj[key] = value.value
          }
          else if (t.isArrayExpression(value)) {
            obj[key] = value.elements.map((el) => {
              if (t.isObjectExpression(el))
                return this.extractObjectExpression(el, ast, currentFilePath)
              if (t.isStringLiteral(el))
                return el.value
              if (t.isNumericLiteral(el))
                return el.value
              if (t.isBooleanLiteral(el))
                return el.value
              if (el == null)
                return null
              return el
            })
          }
          else if (t.isObjectExpression(value)) {
            obj[key] = this.extractObjectExpression(value, ast, currentFilePath)
          }
        }
      }
      return obj
    }

    if (t.isIdentifier(node)) {
      // Local lookup only — for cross-file resolution we route through
      // `resolveExportByName` / `resolveImportedBinding` in analyzePage.
      const index = this.indexCache.get(currentFilePath) ?? this.indexFile(ast, currentFilePath)
      if (index.declarations.has(node.name))
        return this.extractObjectExpression(index.declarations.get(node.name), ast, currentFilePath)
    }

    return undefined
  }

  // ───────────────────────────────────────────────────────────────────────
  // Path resolution — async fs throughout
  // ───────────────────────────────────────────────────────────────────────

  private async resolveImportPath(currentFilePath: string, importSource: string): Promise<string | null> {
    log('Resolving import: %s from %s', importSource, currentFilePath)

    for (const alias of this.pathAliases) {
      if (importSource.startsWith(alias.prefix)) {
        const relativePath = importSource.substring(alias.prefix.length)
        const resolvedPath = path.join(alias.replacement, relativePath)
        log('Resolved alias %s to: %s', alias.prefix, resolvedPath)
        const result = await this.tryResolveWithExtensions(resolvedPath)
        if (result)
          return result
      }
    }

    if (importSource.startsWith('.')) {
      const currentDir = path.dirname(currentFilePath)
      const resolvedPath = path.resolve(currentDir, importSource)
      return this.tryResolveWithExtensions(resolvedPath)
    }

    return null
  }

  private async tryResolveWithExtensions(resolvedPath: string): Promise<string | null> {
    if (await this.fileExists(resolvedPath))
      return resolvedPath

    const extensions = this.getConfiguredExtensions()
    for (const ext of extensions) {
      const pathWithExt = resolvedPath + ext
      if (await this.fileExists(pathWithExt)) {
        log('Resolved to: %s', pathWithExt)
        return pathWithExt
      }
    }

    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, `index${ext}`)
      if (await this.fileExists(indexPath)) {
        log('Resolved to index: %s', indexPath)
        return indexPath
      }
    }

    return null
  }

  /**
   * Best-effort label for a template-literal interpolation, used only so
   * extracted titles like `Page ${id}` round-trip as `Page ${id}` (rather
   * than `Page ` with the substitution silently dropped).
   */
  private describeTemplateExpression(expr: t.Expression | t.TSType): string {
    if (t.isIdentifier(expr))
      return expr.name
    if (t.isMemberExpression(expr) && t.isIdentifier(expr.property))
      return expr.property.name
    if (t.isStringLiteral(expr) || t.isNumericLiteral(expr) || t.isBooleanLiteral(expr))
      return String(expr.value)
    return 'expr'
  }

  /**
   * Resolve the configured extension list, defaulting to
   * `DEFAULT_PAGE_EXTENSIONS` when auto-discovery is disabled or the
   * user didn't override.
   */
  private getConfiguredExtensions(): readonly string[] {
    const ad = this.config.autoDiscovery
    return (ad && ad.extensions && ad.extensions.length > 0)
      ? ad.extensions
      : DEFAULT_PAGE_EXTENSIONS
  }

  /**
   * The named export the discovery looks for on each page file.
   * Defaults to `'llmstxt'`; user-overridable via
   * `autoDiscovery.llmstxtExportName`.
   */
  private getLLMsTxtExportName(): string {
    const ad = this.config.autoDiscovery
    return (ad && ad.llmstxtExportName) || 'llmstxt'
  }

  private async fileExists(p: string): Promise<boolean> {
    try {
      await fsp.access(p)
      return true
    }
    catch {
      return false
    }
  }

  private async directoryExists(dir: string): Promise<boolean> {
    try {
      const stat = await fsp.stat(dir)
      return stat.isDirectory()
    }
    catch {
      return false
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // Misc helpers
  // ───────────────────────────────────────────────────────────────────────

  private normalizeRoute(route: string): string {
    // Single source of truth for route shape — same helper the request
    // dispatcher uses, so the two paths can never drift.
    return normalizePath(route)
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
      .map(segment => this.humaniseRouteSegment(segment))
      .filter(Boolean)
      .join(' - ')
  }

  /**
   * Turn a Next.js route segment into something printable. Strips dynamic-
   * route brackets (`[id]` → `id`), catch-all prefixes (`[...slug]` →
   * `slug`), and parallel/intercepting decorators (`@modal` → `modal`,
   * `(group)` → `group`); then capitalises the first character.
   */
  private humaniseRouteSegment(segment: string): string {
    // Strip leading `(` / `@` decorators and any matching trailing `)`.
    let s = segment.replace(/^[@(]+/, '').replace(/\)+$/, '')
    // Unwrap `[…]` / `[[…]]`, dropping catch-all `...` prefixes.
    s = s.replace(/^\[+\.{0,3}/, '').replace(/\]+$/, '')
    if (!s)
      return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
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
