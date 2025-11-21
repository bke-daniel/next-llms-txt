import type { AutoDiscoveryConfig, LLMsTxtHandlerConfig, RequiredLLMsTxtHandlerConfig } from './types'
import { DEFAULT_CONFIG } from './constants'

function mergeAutoDiscovery(
  inputAutoDiscovery: AutoDiscoveryConfig,

): RequiredLLMsTxtHandlerConfig['autoDiscovery'] {
  if (
    !inputAutoDiscovery
    || typeof inputAutoDiscovery === 'boolean'
  ) {
    return DEFAULT_CONFIG.autoDiscovery
  }
  return {
    ...DEFAULT_CONFIG.autoDiscovery,
    ...inputAutoDiscovery,
  }
}

export default function mergeWithDefaultConfig(
  inputConfig: LLMsTxtHandlerConfig,
): RequiredLLMsTxtHandlerConfig {
  if (!inputConfig)
    return DEFAULT_CONFIG

  return {
    ...DEFAULT_CONFIG,
    ...inputConfig,
    // deep merge for autoDiscovery
    autoDiscovery: !inputConfig.autoDiscovery || typeof inputConfig.autoDiscovery === 'boolean'
      ? DEFAULT_CONFIG.autoDiscovery
      : mergeAutoDiscovery(inputConfig.autoDiscovery),
  }
}
