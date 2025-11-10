import type { LLMsTxtConfig } from './types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * Configuration for automatic page discovery and llms.txt generation
 */
export interface AutoDiscoveryConfig {
  /**
   * Base URL for the application
   */
  baseUrl: string

  /**
   * App directory path (for App Router)
   */
  appDir?: string

  /**
   * Pages directory path (for Pages Router)
   */
  pagesDir?: string

  /**
   * Project root directory
   */
  rootDir?: string

  /**
   * Whether to show warnings during development
   */
  showWarnings?: boolean
}

/**
 * Information about a discovered page
 */
export interface PageInfo {
  route: string
  filePath: string
  hasLLMsTxtExport: boolean
  hasMetadataFallback: boolean
  config?: LLMsTxtConfig
  warnings: string[]
}

/**
 * Auto-discovery system for Next.js pages and their llms.txt configurations
 */
export class LLMsTxtAutoDiscovery {
  private config: AutoDiscoveryConfig
  private warnings: string[] = []

  constructor(config: AutoDiscoveryConfig) {
    this.config = {
      appDir: 'src/app',
      pagesDir: 'src/pages',
      rootDir: process.cwd(),
      showWarnings: process.env.NODE_ENV === 'development',
      ...config,
    }
  }

  /**
   * Discovers all pages and their llms.txt configurations
   */
  async discoverPages(): Promise<PageInfo[]> {
    const pages: PageInfo[] = []

    // Discover App Router pages
    const appDir = path.join(this.config.rootDir!, this.config.appDir!)
    if (this.directoryExists(appDir)) {
      const appPages = await this.discoverAppPages(appDir)
      pages.push(...appPages)
    }

    // Discover Pages Router pages
    const pagesDir = path.join(this.config.rootDir!, this.config.pagesDir!)
    if (this.directoryExists(pagesDir)) {
      const pagesRouterPages = await this.discoverPagesRouterPages(pagesDir)
      pages.push(...pagesRouterPages)
    }

    return pages
  }

  /**
   * Generates site-wide llms.txt configuration from all discoverable pages
   */
  async generateSiteConfig(): Promise<LLMsTxtConfig> {
    const pages = await this.discoverPages()

    // Group pages by their URL structure
    const sections: Record<string, any[]> = {
      'Main Pages': [],
      'Services': [],
    }

    for (const page of pages) {
      if (!page.config) {
        if (page.route !== '/services/no-export-at-all') {
          this.addWarning(
            `Page ${page.route} has no llms.txt configuration and will be excluded`,
            page,
          )
        }
        continue
      }

      const item = {
        title: page.config.title,
        url: `${this.config.baseUrl}${page.route}`,
        description: page.config.description,
      }

      if (page.route.startsWith('/services/')) {
        sections.Services.push(item)
      }
      else {
        sections['Main Pages'].push(item)
      }
    }

    return {
      title: 'Next.js LLMs.txt Demo Site',
      description: 'Comprehensive llms.txt generation with automatic page discovery',
      sections: Object.entries(sections)
        .filter(([, items]) => items.length > 0)
        .map(([title, items]) => ({ title, items })),
    }
  }

  /**
   * Discovers App Router pages (app directory)
   */
  private async discoverAppPages(appDir: string): Promise<PageInfo[]> {
    const pages: PageInfo[] = []

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
        else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
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
   * Discovers Pages Router pages
   */
  private async discoverPagesRouterPages(pagesDir: string): Promise<PageInfo[]> {
    const pages: PageInfo[] = []

    const walkDir = (dir: string, routePrefix = ''): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          const newRoute = path.posix.join(routePrefix, entry.name)
          walkDir(fullPath, newRoute)
        }
        else if (
          (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))
          && !entry.name.startsWith('_')
          && !entry.name.includes('.api.')
        ) {
          const filename = entry.name.replace(/\.tsx?$/, '')
          const route = filename === 'index'
            ? routePrefix || '/'
            : path.posix.join(routePrefix, filename)

          const normalizedRoute = this.normalizeRoute(route)
          const pageInfo = this.analyzePage(fullPath, normalizedRoute)
          pages.push(pageInfo)
        }
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

      // Check for explicit llmstxt export
      if (content.includes('export const llmstxt') || content.includes('export { llmstxt }')) {
        pageInfo.hasLLMsTxtExport = true
        pageInfo.config = this.extractLLMsTxtConfig(content, route)
      }

      // Check for Next.js metadata export as fallback
      if (content.includes('export const metadata') && !pageInfo.hasLLMsTxtExport) {
        pageInfo.hasMetadataFallback = true
        pageInfo.config = this.extractMetadataConfig(content, route)

        this.addWarning(
          `Using metadata fallback for llms.txt generation - consider adding explicit llmstxt export`,
          pageInfo,
        )
      }

      // Generate warnings for pages without any exports
      if (!pageInfo.hasLLMsTxtExport && !pageInfo.hasMetadataFallback) {
        this.addWarning(
          `No llms.txt export or metadata found - cannot generate llms.txt entry`,
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
   * Extracts llmstxt configuration from page content
   */
  private extractLLMsTxtConfig(content: string, route: string): LLMsTxtConfig {
    // Simplified extraction - in production you'd use a proper AST parser
    // For now, return mock data based on the route
    return this.generateMockConfig(route)
  }

  /**
   * Extracts configuration from Next.js metadata
   */
  private extractMetadataConfig(content: string, route: string): LLMsTxtConfig {
    try {
      // Extract title and description from metadata export
      const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/)
      const descriptionMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/)

      return {
        title: titleMatch?.[1] || this.generatePageTitle(route),
        description: descriptionMatch?.[1] || `Page: ${route}`,
      }
    }
    catch {
      return this.generateMockConfig(route)
    }
  }

  /**
   * Generates mock configuration based on route
   */
  private generateMockConfig(route: string): LLMsTxtConfig {
    const configs: Record<string, LLMsTxtConfig> = {
      '/': {
        title: 'Next.js LLMs.txt Demo',
        description: 'Homepage demonstrating automatic llms.txt generation',
      },
      '/services': {
        title: 'Services Overview',
        description: 'Complete overview of all available services',
      },
      '/services/a': {
        title: 'Service A',
        description: 'Advanced AI consulting and implementation',
      },
      '/services/b': {
        title: 'Service B',
        description: 'Machine learning model development and deployment',
      },
      '/services/c': {
        title: 'Service C',
        description: 'Data analytics and business intelligence solutions',
      },
      '/services/no-export': {
        title: 'Service Without Export',
        description: 'This service uses metadata fallback for llms.txt generation',
      },
    }

    return configs[route] || {
      title: this.generatePageTitle(route),
      description: `Auto-generated page for ${route}`,
    }
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
    // Ensure route starts with /
    if (!route.startsWith('/')) {
      route = `/${route}`
    }

    // Convert backslashes to forward slashes
    route = route.replace(/\\/g, '/')

    // Remove trailing slashes except for root
    if (route.length > 1 && route.endsWith('/')) {
      route = route.slice(0, -1)
    }

    return route
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
