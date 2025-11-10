/**
 * next-llms-txt - A Next.js plugin for generating llms.txt files
 *
 * This package helps you generate llms.txt files following the llmstxt.org specification.
 * It provides an API route handler similar to Auth.js for easy integration with automatic
 * page discovery and comprehensive site-wide llms.txt generation.
 */

// Export auto-discovery system
export {
  LLMsTxtAutoDiscovery,
} from './discovery'

export type {
  AutoDiscoveryConfig,
  PageInfo,
} from './discovery'

// Export enhanced functionality
export {
  createEnhancedLLMsTxtHandlers,
  createPageLLMsTxtHandlers,
} from './enhanced-handler'

export type {
  EnhancedHandlerConfig,
} from './enhanced-handler'

// Export generator
export { generateLLMsTxt } from './generator'

// Export handler creators
export { createLLMsTxtHandlers, handlers } from './handler'

// Export types
export type {
  LLMsTxtConfig,
  LLMsTxtHandlerConfig,
  LLMsTxtItem,
  LLMsTxtSection,
} from './types'
