import type { PageInfo } from './discovery.js'

export type { PageInfo }

/**
 * Configuration for llms.txt generation following the llmstxt.org specification
 */
export interface LLMsTxtConfig {
  /**
   * Title for the llms.txt file (H1 header - REQUIRED)
   * Example: "My Project Name"
   */
  title: string

  /**
   * Brief summary about the site (optional blockquote)
   * Example: "A Next.js plugin for generating AI-friendly documentation"
   */
  description?: string

  /**
   * Sections to include in the llms.txt file
   * Each section will be rendered as an H2 header with markdown list items
   */
  sections?: LLMsTxtSection[]

  /**
   * Optional section with secondary information that can be skipped for shorter context
   * This section has special meaning in the llmstxt.org specification
   */
  optional?: LLMsTxtItem[]
}

/**
 * A section in the llms.txt file (rendered as H2)
 * Contains a list of links with descriptions
 */
export interface LLMsTxtSection {
  /**
   * Section title (will be rendered as H2)
   * Example: "Documentation", "Examples", "API Reference"
   */
  title: string

  /**
   * Optional description for the section
   */
  description?: string

  /**
   * List of items in this section
   * Each item is a link with optional description
   */
  items: LLMsTxtItem[]
}

/**
 * An item within a section
 */
export interface LLMsTxtItem {
  /**
   * Display text for the link
   */
  title: string

  /**
   * URL for the link (preferably to markdown files)
   */
  url: string

  /**
   * Optional description for the link
   */
  description?: string
}

/**
 * Global configuration for the llms.txt handler
 */
export interface LLMsTxtHandlerConfig {
  /**
   * Base URL for the application
   */
  baseUrl?: string

  /**
   * Default configuration to use if no page-specific config is found
   */
  defaultConfig?: LLMsTxtConfig

  /**
   * Custom generator function
   */
  generator?: (config: LLMsTxtConfig, pages?: PageInfo[]) => string | undefined

  /**
   * Enable automatic page discovery. Pass `false` to disable, `true` to
   * enable with defaults, or an `AutoDiscoveryConfig` object to customise.
   */
  autoDiscovery?: AutoDiscoveryConfig | boolean

  /**
   * Pages to include in the site-wide llms.txt in addition to (or in place of)
   * any pages found by auto-discovery.
   */
  pages?: PageInfo[]

  /**
   * Support trailing slash variations
   */
  trailingSlash?: boolean

  /**
   * Whether to surface discovery warnings via `console.warn`. Detailed
   * trace-level logs are also available via the `debug` library — set
   * `DEBUG=next-llms-txt:*` in your environment regardless of this flag.
   */
  showWarnings?: boolean

  /**
   * `Cache-Control` header value for the generated llms.txt / *.html.md
   * responses. Defaults to `public, max-age=3600, s-maxage=3600`. Pass
   * `false` to omit the header entirely.
   */
  cacheControl?: string | false

  /**
   * Called when handler execution throws. Receives the original error
   * with its stack intact. Useful for piping into a structured logger
   * (Pino, Winston, Sentry). The handler still returns a 500 response
   * after invoking this hook.
   */
  onError?: (error: unknown) => void

  /**
   * Maximum time (in milliseconds) that page discovery may run for a
   * single request before being aborted. The handler returns a 500
   * response when the timeout fires (or the consumer's
   * `request.signal` aborts first). Defaults to no timeout.
   */
  discoveryTimeoutMs?: number
}

/**
 * Configuration for automatic page discovery and llms.txt generation
 */
export interface AutoDiscoveryConfig {
  /**
   * App directory path (for App Router), relative to `rootDir`.
   */
  appDir?: string

  /**
   * Pages directory path (for Pages Router), relative to `rootDir`.
   */
  pagesDir?: string

  /**
   * Project root directory
   */
  rootDir?: string
}

/**
 * LLMs.txt handler configuration with all keys required except 'generator'
 * and 'pages'. `autoDiscovery` may be `false` to explicitly disable
 * discovery; otherwise its nested fields are required.
 * @internal
 */
export type RequiredLLMsTxtHandlerConfig = Required<
  Omit<LLMsTxtHandlerConfig, 'generator' | 'autoDiscovery' | 'pages'>
> & Pick<LLMsTxtHandlerConfig, 'generator' | 'pages'> & {
  autoDiscovery: Required<AutoDiscoveryConfig> | false
}
