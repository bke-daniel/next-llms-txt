/**
 * Compose the consumer's `request.signal` with an optional discovery
 * timeout. Returns `undefined` when neither source is configured so the
 * downstream `discoverPages(undefined)` keeps its uncancellable fast-path.
 *
 * Uses `AbortSignal.any` (Node 20.3+, Next 16 runtimes) — when not
 * available the caller still gets the request signal alone.
 */
export function composeDiscoverySignal(
  requestSignal: AbortSignal | undefined,
  timeoutMs: number | undefined,
): AbortSignal | undefined {
  const signals: AbortSignal[] = []
  if (requestSignal)
    signals.push(requestSignal)
  if (typeof timeoutMs === 'number' && timeoutMs > 0 && typeof AbortSignal.timeout === 'function')
    signals.push(AbortSignal.timeout(timeoutMs))

  if (signals.length === 0)
    return undefined
  if (signals.length === 1)
    return signals[0]
  if (typeof AbortSignal.any === 'function')
    return AbortSignal.any(signals)
  return signals[0]
}
