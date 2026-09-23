import type { LLMsTxtHandlerConfig } from './types.js'

/**
 * Hand an error to the consumer's `onError` hook and log it. Used for every
 * failure the plugin surfaces, whether or not it ends in a 500: a page that
 * cannot be analysed still lets the site-wide request succeed, but the
 * operator has to hear about it.
 *
 * Logging is not gated by `showWarnings`, which only controls advisories.
 * The error object itself is logged, not just its message, so stack traces
 * and any `cause` chain stay available to structured loggers.
 */
export function reportError(
  config: Pick<LLMsTxtHandlerConfig, 'onError'>,
  message: string,
  error: unknown,
): void {
  if (typeof config.onError === 'function') {
    try {
      config.onError(error)
    }
    catch {
      // Don't let a misbehaving onError hook turn one failure into a
      // different failure mode.
    }
  }
  console.error(`[next-llms-txt] ${message}`, error)
}
