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
 * A user-supplied page entry. Pass these via
 * `LLMsTxtHandlerConfig.pages` to inject additional pages into the
 * generated llms.txt — typically alongside or in place of auto-
 * discovery. Internal discovery fills in the rest of the `PageInfo`
 * fields automatically.
 */
export interface LLMsTxtPage {
  /** Absolute path-style route (e.g. `/blog/post`). */
  route: string
  /** Optional llms.txt config for the route. If omitted the entry is dropped. */
  config?: LLMsTxtConfig
}

/**
 * Global configuration for the llms.txt handler
 */
export interface LLMsTxtHandlerConfig {
  /**
   * Base URL for the application. Used to build absolute URLs in the
   * generated markdown. Lives at the top level of the config — NOT
   * inside `autoDiscovery`. Strongly recommended in production; falls
   * back to `http://localhost:${PORT ?? 3000}` if omitted.
   */
  baseUrl?: string

  /**
   * Default configuration to use if no page-specific config is found.
   * Sibling keys are deep-merged with `DEFAULT_CONFIG.defaultConfig` so a
   * partial override (e.g. just `title`) doesn't drop unspecified fields.
   */
  defaultConfig?: LLMsTxtConfig

  /**
   * Custom generator function. When set, the plugin defers to this for
   * markdown rendering and skips the built-in `generateLLMsTxt`.
   */
  generator?: (config: LLMsTxtConfig, pages?: LLMsTxtPage[]) => string | undefined

  /**
   * Enable automatic page discovery. Pass `false` to disable, `true` to
   * enable with defaults, or an `AutoDiscoveryConfig` object to customise.
   */
  autoDiscovery?: AutoDiscoveryConfig | boolean

  /**
   * Pages to include in the site-wide llms.txt in addition to (or in
   * place of) any pages found by auto-discovery. User entries win when
   * a route also matches a discovered page.
   */
  pages?: LLMsTxtPage[]

  /**
   * Support trailing slash variations
   */
  trailingSlash?: boolean

  /**
   * Whether to surface per-page discovery advisories via `console.warn`
   * (metadata fallback used, no export found, …). Defaults to on in
   * development. Failures are never gated by this flag: a page that cannot
   * be parsed goes to `onError` and `console.error`, and a configuration
   * whose discovery directories do not exist is always warned about.
   * Detailed trace-level logs are also available via the `debug` library —
   * set `DEBUG=next-llms-txt:*` in your environment regardless of this flag.
   */
  showWarnings?: boolean

  /**
   * `Cache-Control` header value for the generated llms.txt / *.html.md
   * responses. Defaults to `public, max-age=3600, s-maxage=3600`. Pass
   * `false` to omit the header entirely.
   */
  cacheControl?: string | false

  /**
   * Called for every failure the plugin surfaces, with the original error
   * (stack and `cause` intact). Useful for piping into a structured logger
   * (Pino, Winston, Sentry). Two kinds of failure reach it:
   *
   * - a request that throws; the handler still returns a 500 afterwards
   * - a page file that auto-discovery could not read or parse; the
   *   site-wide `llms.txt` is still served (without that page) and the
   *   page's own `*.html.md` route answers 500
   *
   * Failures are also logged with `console.error`, independent of
   * `showWarnings`, which only controls advisories.
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
   * Project root directory. Empty string means "resolve against
   * `process.cwd()` at discovery time"; never freeze
   * `process.cwd()` here at module-load time.
   */
  rootDir?: string

  /**
   * Name of the named export discovery looks for on each page file.
   * Defaults to `'llmstxt'`. Override if your project uses a different
   * convention (e.g. `'pageLLmsTxt'`).
   */
  llmstxtExportName?: string

  /**
   * File-extension priority for both page detection AND import
   * resolution. Defaults to `['.ts', '.tsx', '.js', '.jsx']`. Reorder
   * (or shrink) if a workspace uses `.ts` for compiled artifacts and
   * needs `.tsx` source files to win.
   */
  extensions?: readonly string[]
}

/**
 * Map every leaf of `T` to its non-optional, non-nullable variant.
 * Only used for `autoDiscovery`, where the merge truly fills every
 * leaf with a default. For `defaultConfig` we keep the original
 * (partial) shape because consumers may legitimately supply a config
 * with just a `title`.
 */
type DeepRequired<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { [K in keyof T]-?: DeepRequired<NonNullable<T[K]>> }
    : T

/**
 * LLMs.txt handler configuration with all top-level keys present.
 * `autoDiscovery` may be `false` (explicit disable) — when an object,
 * its nested fields are guaranteed present. `defaultConfig` is the
 * user-input shape with its nested fields STILL optional, since the
 * merge can't synthesise a meaningful `title` if the user didn't give
 * one.
 * @internal
 */
export type RequiredLLMsTxtHandlerConfig
  = & Required<Omit<LLMsTxtHandlerConfig, 'generator' | 'autoDiscovery' | 'pages' | 'onError' | 'cacheControl' | 'discoveryTimeoutMs'>>
    & Pick<LLMsTxtHandlerConfig, 'generator' | 'pages' | 'onError' | 'cacheControl' | 'discoveryTimeoutMs'>
    & {
      autoDiscovery: DeepRequired<AutoDiscoveryConfig> | false
    }
