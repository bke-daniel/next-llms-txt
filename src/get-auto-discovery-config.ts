import type { AutoDiscoveryConfig, LLMsTxtHandlerConfig } from './types'

export function getAutoDiscoveryConfig(handlerConfig: LLMsTxtHandlerConfig): AutoDiscoveryConfig {
  if (typeof handlerConfig.autoDiscovery === 'object') {
    return handlerConfig.autoDiscovery
  }
  if (!handlerConfig.baseUrl) {
    throw new Error('A `baseUrl` is required for auto-discovery.')
  }
  return { baseUrl: handlerConfig.baseUrl }
}
