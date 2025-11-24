import type { NextRequest, NextResponse } from 'next/server'
import type { LLMsTxtHandlerConfig } from './types.js'
import createMarkdownResponse from './create-markdown-response.js'
import { LLMsTxtAutoDiscovery } from './discovery.js'
import { generateLLMsTxt } from './generator.js'
// import { getAutoDiscoveryConfig } from './get-auto-discovery-config.js'

/**
 * Handles requests for the site-wide llms.txt file.
 */
export default async function handleSiteRequest(
  _request: NextRequest,
  handlerConfig: LLMsTxtHandlerConfig,
): Promise<NextResponse> {
  let finalConfig = handlerConfig.defaultConfig
  let pages = (handlerConfig as any).pages || []

  if (handlerConfig.autoDiscovery) {
    // const discoveryConfig = getAutoDiscoveryConfig(handlerConfig)
    const discovery = new LLMsTxtAutoDiscovery(handlerConfig as any)
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

  // handles custom generator if provided
  const content = handlerConfig.generator
    ? handlerConfig.generator(finalConfig, pages)
    : generateLLMsTxt(finalConfig, pages)

  if (!content)
    throw new Error('Couldn\'t generate Config')

  return createMarkdownResponse(content)
}
