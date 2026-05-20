/**
 * Local copy of the ES2022 `ErrorOptions` shape so the type compiles
 * cleanly when a consumer's `tsconfig.lib` predates ES2022 (cypress-tests
 * is the canonical example in this repo).
 */
interface LLMsTxtErrorOptions {
  cause?: unknown
}

/**
 * Attach `options.cause` to a freshly-constructed Error without relying
 * on the ES2022 two-arg `Error(message, options)` constructor — that
 * signature is unavailable when a consumer's `lib` target predates
 * ES2022.
 */
function applyCause(err: Error, options?: LLMsTxtErrorOptions): void {
  if (options && 'cause' in options)
    (err as Error & { cause?: unknown }).cause = options.cause
}

/**
 * Base class for all next-llms-txt runtime errors. Consumers can
 * `instanceof`-check against this to catch any plugin-thrown error.
 */
export class LLMsTxtError extends Error {
  constructor(message: string, options?: LLMsTxtErrorOptions) {
    super(message)
    this.name = 'LLMsTxtError'
    applyCause(this, options)
  }
}

/**
 * Thrown when the supplied configuration is missing or invalid (e.g. no
 * `defaultConfig.title`, no `pages`, no enabled `autoDiscovery`).
 */
export class LLMsTxtConfigError extends LLMsTxtError {
  constructor(message: string, options?: LLMsTxtErrorOptions) {
    super(message, options)
    this.name = 'LLMsTxtConfigError'
  }
}

/**
 * Thrown when a custom `generator` returns a falsy value or content
 * generation otherwise fails.
 */
export class LLMsTxtGenerationError extends LLMsTxtError {
  constructor(message: string, options?: LLMsTxtErrorOptions) {
    super(message, options)
    this.name = 'LLMsTxtGenerationError'
  }
}
