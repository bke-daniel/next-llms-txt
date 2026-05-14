import type { NextRequest, NextResponse } from 'next/server'
import type { LLMsTxtHandlerConfig, PageInfo, RequiredLLMsTxtHandlerConfig } from './types.js'
import createMarkdownResponse from './create-markdown-response.js'
import { LLMsTxtAutoDiscovery } from './discovery.js'
import { generateLLMsTxt } from './generator.js'
import mergeConfig from './merge-with-default-config.js'

/**
 * Handles requests for the site-wide llms.txt file.
 */
export default async function handleSiteRequest(
  _request: NextRequest,
  handlerConfig: LLMsTxtHandlerConfig,
): Promise<NextResponse> {
  const userPages: PageInfo[] = handlerConfig.pages ?? []
  let pages: PageInfo[] = [...userPages]
  let finalConfig = handlerConfig.defaultConfig

  if (handlerConfig.autoDiscovery) {
    const mergedConfig: RequiredLLMsTxtHandlerConfig = mergeConfig(handlerConfig)
    const discovery = new LLMsTxtAutoDiscovery(mergedConfig)
    const discoveredPages = await discovery.discoverPages()
    pages = [...pages, ...discoveredPages]

    const siteConfigFromDiscovery = await discovery.generateSiteConfig()
    const userSections = finalConfig?.sections ?? []
    const discoveredSections = siteConfigFromDiscovery.sections ?? []
    finalConfig = {
      ...siteConfigFromDiscovery,
      ...finalConfig,
      sections: [...userSections, ...discoveredSections],
    }
  }

  if (!finalConfig?.title) {
    throw new Error('LLMs.txt configuration must have a title.')
  }

  const content = handlerConfig.generator
    ? handlerConfig.generator(finalConfig, pages)
    : generateLLMsTxt(finalConfig, pages)

  if (!content)
    throw new Error('Couldn\'t generate Config')

  return createMarkdownResponse(content)
}
