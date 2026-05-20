import type { NextRequest } from 'next/server'
import type { LLMsTxtHandlerConfig, RequiredLLMsTxtHandlerConfig } from './types.js'
import { NextResponse } from 'next/server'
import { PAGE_ERROR_NOTIFICATION } from './constants.js'
import createMarkdownResponse from './create-markdown-response.js'
import { LLMsTxtAutoDiscovery } from './discovery.js'
import { generateLLMsTxt } from './generator.js'
import mergeConfig from './merge-with-default-config.js'
import normalizePath from './normalize-path.js'
import { composeDiscoverySignal } from './request-signal.js'

const AUTODISCOVERY_OFF_BODY = 'Auto-discovery must be enabled for page-specific llms.txt files.'
const GENERATOR_RETURNED_EMPTY_BODY = 'Generator returned empty content for this page.'

/**
 * Handles requests for per-page *.html.md files.
 *
 * Status-code contract (P2 #39):
 *   400 → configuration says auto-discovery is off (client misuse)
 *   404 → discovery is on but the requested route has no matching page
 *   500 → page matched but the generator returned empty (server bug)
 *
 * Every error response is built fresh per request. Web `Response` bodies
 * are single-use streams, so returning a shared module-level instance
 * from concurrent requests leads to platform-dependent body-already-
 * consumed errors.
 */
export default async function handlePageRequest(
  request: NextRequest,
  handlerConfig: LLMsTxtHandlerConfig,
): Promise<NextResponse> {
  if (!handlerConfig.autoDiscovery) {
    return new NextResponse(AUTODISCOVERY_OFF_BODY, { status: 400 })
  }

  const { pathname } = new URL(request.url)
  const mergedConfig: RequiredLLMsTxtHandlerConfig = mergeConfig(handlerConfig)
  const discovery = new LLMsTxtAutoDiscovery(mergedConfig)
  const signal = composeDiscoverySignal(
    (request as { signal?: AbortSignal }).signal,
    handlerConfig.discoveryTimeoutMs,
  )
  const pages = await discovery.discoverPages(signal)

  // Strip .html.md extension and normalise so trailing-slash, Windows-
  // backslash, and `/index` variants all collapse to the same key.
  const routePath = pathname.replace(/\.html\.md$/, '')
  const requestedRoute = normalizePath(routePath)
  const matchingPage = pages.find(page => normalizePath(page.route) === requestedRoute)

  if (!matchingPage?.config) {
    return new NextResponse(PAGE_ERROR_NOTIFICATION, { status: 404 })
  }

  const content = handlerConfig.generator
    ? handlerConfig.generator(matchingPage.config)
    // single-page request → no `pages` list to pass to the generator
    : generateLLMsTxt(matchingPage.config)

  if (!content)
    return new NextResponse(GENERATOR_RETURNED_EMPTY_BODY, { status: 500 })

  return createMarkdownResponse(content, handlerConfig.cacheControl)
}
