import type { NextRequest } from 'next/server'
import type { LLMsTxtHandlerConfig } from './types.js'
import { NextResponse } from 'next/server'
import handlePageRequest from './handle-page-request.js'
import handleSiteRequest from './handle-site-request.js'
import mergeConfig from './merge-with-default-config.js'
import validateConfig from './validate-config.js'

/**
 * Strip the trailing slash from a pathname (other than the root `/`) so
 * `/llms.txt/` and `/llms.txt` route to the same handler. Query strings
 * are already excluded by `URL.pathname`, so we don't need to handle them
 * here.
 */
function normalizeDispatchPath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/'))
    return pathname.slice(0, -1)
  return pathname
}

/**
 * Creates a handler for generating llms.txt files in Next.js 16+ proxy.
 *
 * Acts as a single entry point for both a site-wide `llms.txt` and per-page
 * `*.html.md` files, with optional auto-discovery of page configurations.
 * Designed to work with Next.js 16+ proxy.ts (Routing Middleware) to
 * intercept `/llms.txt` and `/*.html.md` requests.
 *
 * `baseUrl` lives on the top-level config — not nested inside
 * `autoDiscovery`. It is used to build absolute URLs in the generated
 * markdown.
 *
 * @param config - The configuration for the handler.
 * @returns An object with a `GET` method for use in Next.js proxy or route handlers.
 *
 * @example
 * ```typescript
 * // src/proxy.ts
 * import { createLLmsTxt, isLLMsTxtPath } from 'next-llms-txt';
 *
 * const { GET: handleLLmsTxt } = createLLmsTxt({
 *   baseUrl: 'https://example.com',
 *   defaultConfig: { title: 'My Site' },
 *   autoDiscovery: true,
 * });
 *
 * export default async function proxy(request: NextRequest) {
 *   if (isLLMsTxtPath(request.nextUrl.pathname)) {
 *     return await handleLLmsTxt(request);
 *   }
 *   return NextResponse.next();
 * }
 * ```
 */
export function createLLmsTxt(
  config: LLMsTxtHandlerConfig,
): {
  GET: (request: NextRequest) => Promise<NextResponse>
} {
  // Static config work happens once at factory construction, not per request.
  const validatedConfig = validateConfig(config)
  const mergedConfig = mergeConfig(validatedConfig)

  const GET = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { pathname } = new URL(request.url)
      const dispatchPath = normalizeDispatchPath(pathname)

      if (dispatchPath === '/llms.txt') {
        return await handleSiteRequest(request, mergedConfig)
      }
      return await handlePageRequest(request, mergedConfig)
    }
    catch (error) {
      if (typeof config.onError === 'function') {
        try {
          config.onError(error)
        }
        catch {
          // Don't let a misbehaving onError hook turn a 500 into a different
          // failure mode.
        }
      }
      // Log the error object itself, not just the message — keeps the stack
      // trace and any `cause` chain available to structured loggers.

      console.error('[next-llms-txt] Error generating llms.txt:', error)
      return new NextResponse('Error generating llms.txt', { status: 500 })
    }
  }

  return { GET }
}
