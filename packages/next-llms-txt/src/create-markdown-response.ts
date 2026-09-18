import { NextResponse } from 'next/server'

export const DEFAULT_CACHE_CONTROL = 'public, max-age=3600, s-maxage=3600'

/**
 * Builds the `200 text/markdown` response used by both the site-wide and
 * per-page handlers.
 *
 * The `Cache-Control` header defaults to a one-hour public/CDN cache and
 * can be overridden via `LLMsTxtHandlerConfig.cacheControl` (pass `false`
 * to omit the header entirely).
 */
export default function createMarkdownResponse(
  content: string,
  cacheControl: string | false = DEFAULT_CACHE_CONTROL,
): NextResponse {
  const headers: Record<string, string> = {
    'Content-Type': 'text/markdown; charset=utf-8',
  }
  if (cacheControl !== false)
    headers['Cache-Control'] = cacheControl

  return new NextResponse(content, { status: 200, headers })
}
