import type { LLMsTxtConfig, LLMsTxtHandlerConfig } from './types'
// TODO Create tests for this

/**
 * Validates the provided configuration for llms.txt generation.
 *
 * Ensures that either a manual configuration with a title or an auto-discovery
 * configuration is provided, but not both simultaneously.
 */
export default function validateConfig(config: LLMsTxtConfig | LLMsTxtHandlerConfig): LLMsTxtHandlerConfig {
  // const isManualConfig = !('defaultConfig' in config) && !!(config as any).title
  // const isAutoDiscovery = !!(config as any).autoDiscovery
  const handlerConfig = ('defaultConfig' in config ? config : { defaultConfig: config }) as LLMsTxtHandlerConfig
  // TODO re-enable this validation
  // if ((isManualConfig && isAutoDiscovery) || (handlerConfig.defaultConfig && handlerConfig.autoDiscovery)) {
  //   throw new Error('Cannot use both manual config and auto-discovery together. Choose one.')
  // }

  // if (!handlerConfig.defaultConfig?.title && !handlerConfig.autoDiscovery) {
  //   throw new Error(
  //     'A `defaultConfig` with a `title` or `autoDiscovery` must be provided.',
  //   )
  // }

  // TODO handle no config at all (error)
  return handlerConfig
}
