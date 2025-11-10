/**
 * next-llms-txt - A Next.js plugin for generating llms.txt files
 *
 * This package helps you generate llms.txt files following the llmstxt.org specification.
 * It provides a single, unified API route handler for easy integration, with support for
 * automatic page discovery and comprehensive site-wide llms.txt generation.
 */

// Export supporting components and types
export { LLMsTxtAutoDiscovery } from './discovery'

export type { PageInfo } from './discovery'

export { generateLLMsTxt } from './generator'
// Export the main handler creation function
export { createLLmsTxt } from './handler'
// Export core types
export type {
  AutoDiscoveryConfig,
  LLMsTxtConfig,
  LLMsTxtHandlerConfig,
  LLMsTxtItem,
  LLMsTxtSection,
} from './types'
