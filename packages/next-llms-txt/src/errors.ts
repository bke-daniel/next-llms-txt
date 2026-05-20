/**
 * Base class for all next-llms-txt runtime errors. Consumers can
 * `instanceof`-check against this to catch any plugin-thrown error.
 */
export class LLMsTxtError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'LLMsTxtError'
  }
}

/**
 * Thrown when the supplied configuration is missing or invalid (e.g. no
 * `defaultConfig.title`, no `pages`, no enabled `autoDiscovery`).
 */
export class LLMsTxtConfigError extends LLMsTxtError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'LLMsTxtConfigError'
  }
}

/**
 * Thrown when a custom `generator` returns a falsy value or content
 * generation otherwise fails.
 */
export class LLMsTxtGenerationError extends LLMsTxtError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'LLMsTxtGenerationError'
  }
}
