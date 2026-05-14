import type { AutoDiscoveryConfig, LLMsTxtHandlerConfig, RequiredLLMsTxtHandlerConfig } from './types'
import { DEFAULT_CONFIG } from './constants'

function mergeAutoDiscovery(
  inputAutoDiscovery: AutoDiscoveryConfig,
): Required<AutoDiscoveryConfig> {
  return {
    ...(DEFAULT_CONFIG.autoDiscovery as Required<AutoDiscoveryConfig>),
    ...inputAutoDiscovery,
  }
}

export default function mergeWithDefaultConfig(
  inputConfig: LLMsTxtHandlerConfig,
): RequiredLLMsTxtHandlerConfig {
  if (!inputConfig)
    return DEFAULT_CONFIG

  let autoDiscovery: RequiredLLMsTxtHandlerConfig['autoDiscovery']
  if (inputConfig.autoDiscovery === false) {
    autoDiscovery = false
  }
  else if (inputConfig.autoDiscovery === undefined || inputConfig.autoDiscovery === true) {
    autoDiscovery = DEFAULT_CONFIG.autoDiscovery
  }
  else {
    autoDiscovery = mergeAutoDiscovery(inputConfig.autoDiscovery)
  }

  return {
    ...DEFAULT_CONFIG,
    ...inputConfig,
    autoDiscovery,
  }
}
