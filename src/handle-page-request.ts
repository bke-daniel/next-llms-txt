import type { NextRequest } from 'next/server'
import type { LLMsTxtConfig, LLMsTxtHandlerConfig } from './types'
import { NextResponse } from 'next/server'
import createMarkdownResponse from './create-markdown-response'
import { LLMsTxtAutoDiscovery } from './discovery'
import { generateLLMsTxt } from './generator'
import { getAutoDiscoveryConfig } from './get-auto-discovery-config'
import normalizePath from './normalize-path'

/**
 * Handles requests for per-page *.html.md files.
 */
export default async function handlePageRequest(
  request: NextRequest,
  handlerConfig: LLMsTxtHandlerConfig,
): Promise<NextResponse> {
  if (!handlerConfig.autoDiscovery) {
    return new NextResponse(
      'Auto-discovery must be enabled for page-specific llms.txt files.',
      { status: 400 },
    )
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
