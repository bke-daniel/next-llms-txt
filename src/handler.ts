import type { NextRequest } from 'next/server'
import type { AutoDiscoveryConfig, LLMsTxtConfig, LLMsTxtHandlerConfig } from './types'
import { NextResponse } from 'next/server'
import { LLMsTxtAutoDiscovery } from './discovery'
import { generateLLMsTxt } from './generator'

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
  config: LLMsTxtConfig | LLMsTxtHandlerConfig,
): {
  GET: (request: NextRequest) => Promise<NextResponse>
} {
  const handlerConfig = ('defaultConfig' in config ? config : { defaultConfig: config }) as LLMsTxtHandlerConfig

  if (!handlerConfig.defaultConfig?.title && !handlerConfig.autoDiscovery) {
    throw new Error(
      'A `defaultConfig` with a `title` or `autoDiscovery` must be provided.',
    )
  }

  const GET = async (request: NextRequest): Promise<NextResponse> => {
    const { pathname } = new URL(request.url)

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

/**
 * Handles requests for the site-wide llms.txt file.
 */
async function handleSiteRequest(
  _request: NextRequest,
  handlerConfig: LLMsTxtHandlerConfig,
): Promise<NextResponse> {
  let finalConfig = handlerConfig.defaultConfig
  let pages = (handlerConfig as any).pages || []

  if (handlerConfig.autoDiscovery) {
    const discoveryConfig = getAutoDiscoveryConfig(handlerConfig)
    const discovery = new LLMsTxtAutoDiscovery(discoveryConfig)
    const discoveredPages = await discovery.discoverPages()
    pages = [...pages, ...discoveredPages]

    const siteConfigFromDiscovery = await discovery.generateSiteConfig()
    finalConfig = {
      ...siteConfigFromDiscovery,
      ...finalConfig,
      sections: siteConfigFromDiscovery.sections || [],
    }
  }

  if (!finalConfig?.title) {
    throw new Error('LLMs.txt configuration must have a title.')
  }

  const content = handlerConfig.generator
    ? handlerConfig.generator(finalConfig, pages)
    : generateLLMsTxt(finalConfig, pages)

  return createMarkdownResponse(content)
}

/**
 * Handles requests for per-page *.html.md files.
 */
async function handlePageRequest(
  request: NextRequest,
  handlerConfig: LLMsTxtHandlerConfig,
): Promise<NextResponse> {
  if (!handlerConfig.autoDiscovery) {
    return new NextResponse('Auto-discovery must be enabled for page-specific llms.txt files.', { status: 400 })
  }

  const { pathname } = new URL(request.url)
  const discoveryConfig = getAutoDiscoveryConfig(handlerConfig)
  const discovery = new LLMsTxtAutoDiscovery(discoveryConfig)
  const pages = await discovery.discoverPages()

  // Strip .html.md extension to get the actual route
  const routePath = pathname.replace(/\.html\.md$/, '')
  const requestedRoute = normalizePath(routePath)
  const matchingPage = pages.find(page => normalizePath(page.route) === requestedRoute)

  if (!matchingPage?.config) {
    return new NextResponse('Page not found or no llms.txt configuration available.', { status: 404 })
  }

  const pageConfig: LLMsTxtConfig = {
    ...matchingPage.config,
    sections: [
      {
        title: 'This Page',
        items: [{
          title: matchingPage.config.title,
          url: `${discoveryConfig.baseUrl}${requestedRoute}`,
          description: matchingPage.config.description,
        }],
      },
    ],
  }

  const content = handlerConfig.generator
    ? handlerConfig.generator(pageConfig)
    : generateLLMsTxt(pageConfig)

  return createMarkdownResponse(content)
}

/**
 * Helper functions.
 */
export function getAutoDiscoveryConfig(handlerConfig: LLMsTxtHandlerConfig): AutoDiscoveryConfig {
  if (typeof handlerConfig.autoDiscovery === 'object') {
    return handlerConfig.autoDiscovery
  }
  if (!handlerConfig.baseUrl) {
    throw new Error('A `baseUrl` is required for auto-discovery.')
  }
  return { baseUrl: handlerConfig.baseUrl }
}

export function normalizePath(path: string): string {
  let normalized = path.endsWith('/index') ? path.slice(0, -5) || '/' : path
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

function createMarkdownResponse(content: string): NextResponse {
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
