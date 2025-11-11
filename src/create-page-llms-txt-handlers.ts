import type { LLMsTxtHandlerConfig } from './types'
import { createLLmsTxt } from './handler'

/**
 * Per-page .html.md handler (for dynamic API routes)
 */
export default function createPageLLMsTxtHandlers(baseUrl: string, config?: Partial<LLMsTxtHandlerConfig>) {
  const autoDiscovery = typeof config?.autoDiscovery === 'object' ? { ...config.autoDiscovery, baseUrl } : { baseUrl }
  return createLLmsTxt({
    autoDiscovery,
    ...config,
  })
}
