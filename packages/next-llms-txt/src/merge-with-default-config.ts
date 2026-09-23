import type { AutoDiscoveryConfig, LLMsTxtConfig, LLMsTxtHandlerConfig, RequiredLLMsTxtHandlerConfig } from './types'
import { DEFAULT_CONFIG } from './constants'

function mergeAutoDiscovery(
  inputAutoDiscovery: AutoDiscoveryConfig,
): RequiredLLMsTxtHandlerConfig['autoDiscovery'] {
  // `DEFAULT_CONFIG.autoDiscovery` is frozen and may be `false` in the
  // type but is always an object at runtime; pull it out explicitly so
  // the spread is type-safe.
  const defaults = DEFAULT_CONFIG.autoDiscovery
  if (defaults === false)
    return { ...inputAutoDiscovery } as RequiredLLMsTxtHandlerConfig['autoDiscovery']
  return {
    ...defaults,
    ...inputAutoDiscovery,
  }
}

function mergeDefaultConfig(input: LLMsTxtConfig | undefined): LLMsTxtConfig {
  const defaults = DEFAULT_CONFIG.defaultConfig
  if (!input)
    return { ...defaults }
  return {
    ...defaults,
    ...input,
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
    defaultConfig: mergeDefaultConfig(inputConfig.defaultConfig),
    autoDiscovery,
  }
}
