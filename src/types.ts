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
   * Enable automatic page discovery
   */
  // TODO make this boolean as well
  autoDiscovery?: AutoDiscoveryConfig

  /**
   * Support trailing slash variations
   */
  trailingSlash?: boolean

  /**
   * Whether to show warnings during development
   */
  showWarnings?: boolean
}

/**
 * Configuration for automatic page discovery and llms.txt generation
 */
export interface AutoDiscoveryConfig {
  /**
   * Will be used for the llms.txt
   */
  // pageTitle: string
  /**
   * Will be used for the llms.txt
   */
  // pageDescription: string

  /**
   * App directory path (for App Router)
   */
  appDir?: string

  /**
   * Pages directory path (for Pages Router)
   */
  // pagesDir?: string

  /**
   * Project root directory
   */
  rootDir?: string
}
