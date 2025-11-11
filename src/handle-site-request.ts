import type { NextRequest, NextResponse } from 'next/server'
import type { LLMsTxtHandlerConfig } from './types'
import createMarkdownResponse from './create-markdown-response'
import { LLMsTxtAutoDiscovery } from './discovery'
import { generateLLMsTxt } from './generator'
import { getAutoDiscoveryConfig } from './get-auto-discovery-config'

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
