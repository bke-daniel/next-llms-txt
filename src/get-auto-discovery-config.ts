import type { AutoDiscoveryConfig, LLMsTxtHandlerConfig } from './types.js'
import { DEFAULT_CONFIG } from './constants.js'

export function getAutoDiscoveryConfig(handlerConfig: LLMsTxtHandlerConfig): AutoDiscoveryConfig {
  if (typeof handlerConfig.autoDiscovery === 'object') {
    return handlerConfig.autoDiscovery
  }
  if (!handlerConfig.baseUrl) {
    throw new Error('A `baseUrl` is required for auto-discovery.')
  }
  return handlerConfig.autoDiscovery || DEFAULT_CONFIG.autoDiscovery!
}
