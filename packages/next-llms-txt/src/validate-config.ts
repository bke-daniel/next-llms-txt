import type { LLMsTxtHandlerConfig } from './types.js'

/**
 * Validates the provided configuration for llms.txt generation.
 *
 * Ensures a configuration object is provided and that at least one source of
 * llms.txt content is configured — either a `defaultConfig` with a `title`,
 * a non-empty `pages` array, or an enabled `autoDiscovery`.
 */
export default function validateConfig(config: LLMsTxtHandlerConfig): LLMsTxtHandlerConfig {
  if (!config) {
    throw new Error('No configuration provided for llms.txt generation.')
  }

  const hasTitle = Boolean(config.defaultConfig?.title)
  const hasAutoDiscovery = config.autoDiscovery !== false && config.autoDiscovery !== undefined
  const hasManualPages = Array.isArray(config.pages) && config.pages.length > 0

  if (!hasTitle && !hasAutoDiscovery && !hasManualPages) {
    throw new Error(
      'A `defaultConfig` with a `title`, a non-empty `pages` array, or an enabled `autoDiscovery` must be provided.',
    )
  }

  return config
}
