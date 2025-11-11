import type { NextRequest } from 'next/server'
import type { LLMsTxtHandlerConfig } from './types.js'
import { NextResponse } from 'next/server'
import handlePageRequest from './handle-page-request.js'
import handleSiteRequest from './handle-site-request.js'
import validateConfig from './validate-config.js'

/**
 * Creates a handler for generating llms.txt files in Next.js middleware.
 *
 * This function acts as a single entry point for creating both a site-wide `llms.txt`
 * and per-page `*.html.md` files, with optional auto-discovery of page configurations.
 * Designed to work seamlessly with Next.js middleware to intercept `/llms.txt` and `/*.html.md` requests.
 *
 * @param config - The configuration for the handler.
 * @returns An object with a `GET` method for use in Next.js middleware or route handlers.
 *
 * @example
 * ```typescript
 * // src/middleware.ts
 * const { GET: handleLLmsTxt } = createLLmsTxt({
 *   autoDiscovery: {
 *     baseUrl: 'https://example.com',
 *   },
 * });
 *
 * export async function middleware(request: NextRequest) {
 *   if (request.nextUrl.pathname === '/llms.txt' || request.nextUrl.pathname.endsWith('.html.md')) {
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
  const GET = async (request: NextRequest): Promise<NextResponse> => {
    const { pathname } = new URL(request.url)
    const handlerConfig = validateConfig(config)
    try {
      // Route to the appropriate handler based on the request path
      if (pathname === '/llms.txt') {
        return handleSiteRequest(request, handlerConfig)
      }
      else {
        return handlePageRequest(request, handlerConfig)
      }
    }
    catch (error) {
      console.error('[next-llms-txt] Error generating llms.txt:', error)
      return new NextResponse('Error generating llms.txt', { status: 500 })
    }
  }

  return { GET }
}
