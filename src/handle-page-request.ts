import type { NextRequest } from 'next/server'
import type { LLMsTxtConfig, LLMsTxtHandlerConfig } from './types.js'
import { NextResponse } from 'next/server'
import { PAGE_ERROR_NOTIFICATION } from './constants.js'
import createMarkdownResponse from './create-markdown-response.js'
import { LLMsTxtAutoDiscovery } from './discovery.js'
import { generateLLMsTxt } from './generator.js'
// import { getAutoDiscoveryConfig } from './get-auto-discovery-config.js'
import normalizePath from './normalize-path.js'

const errorResponse = new NextResponse(
  'Auto-discovery must be enabled for page-specific llms.txt files.',
  { status: 400 },
)

/**
 * Handles requests for per-page *.html.md files.
 */
export default async function handlePageRequest(
  request: NextRequest,
  handlerConfig: LLMsTxtHandlerConfig,
): Promise<NextResponse> {
  if (!handlerConfig.autoDiscovery) {
    return errorResponse
  }

  const { pathname } = new URL(request.url)
  // const discoveryConfig = getAutoDiscoveryConfig(handlerConfig)
  const discovery = new LLMsTxtAutoDiscovery(handlerConfig)
  const pages = await discovery.discoverPages()

  // Strip .html.md extension to get the actual route
  const routePath = pathname.replace(/\.html\.md$/, '')
  const requestedRoute = normalizePath(routePath)
  const matchingPage = pages.find(page => normalizePath(page.route) === requestedRoute)

  if (!matchingPage?.config) {
    return new NextResponse(PAGE_ERROR_NOTIFICATION, { status: 404 })
  }

  // handles custom generator if provided
  const content = handlerConfig.generator
    ? handlerConfig.generator(matchingPage.config)
    // why not pass pages? because this is a single page request
    : generateLLMsTxt(matchingPage.config)

  if (!content)
    return errorResponse

  return createMarkdownResponse(content)
}
