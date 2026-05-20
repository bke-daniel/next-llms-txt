import type { NextRequest, NextResponse } from 'next/server'
import type { LLMsTxtHandlerConfig, LLMsTxtSection, PageInfo, RequiredLLMsTxtHandlerConfig } from './types.js'
import createMarkdownResponse from './create-markdown-response.js'
import { LLMsTxtAutoDiscovery } from './discovery.js'
import { generateLLMsTxt } from './generator.js'
import mergeConfig from './merge-with-default-config.js'

/**
 * De-dupe user-supplied pages against routes already emitted by
 * auto-discovered sections. Any user page whose route is also discovered
 * stays in the `## Pages` block (user wins for the cross-source override),
 * and the corresponding entry inside the discovered section is removed so
 * the route appears exactly once in the generated output.
 *
 * Section item URLs are absolute (`baseUrl + route`); we mirror that to
 * compute the lookup key for each user route.
 */
function reconcileUserPagesWithSections(
  userPages: PageInfo[],
  discoveredSections: LLMsTxtSection[],
  baseUrl: string,
): LLMsTxtSection[] {
  if (userPages.length === 0)
    return discoveredSections

  const userRouteUrls = new Set(userPages.map(p => `${baseUrl}${p.route}`))

  return discoveredSections
    .map<LLMsTxtSection>(section => ({
      ...section,
      items: section.items.filter(item => !userRouteUrls.has(item.url)),
    }))
    .filter(section => section.items.length > 0)
}

/**
 * De-dupe `userPages` by route — the user entry wins so consumers can
 * override an auto-discovered page's config. Preserves first-occurrence
 * order so behaviour is deterministic.
 */
function dedupePagesByRoute(pages: PageInfo[]): PageInfo[] {
  const seen = new Set<string>()
  const out: PageInfo[] = []
  for (const page of pages) {
    if (seen.has(page.route))
      continue
    seen.add(page.route)
    out.push(page)
  }
  return out
}

/**
 * Handles requests for the site-wide llms.txt file.
 */
export default async function handleSiteRequest(
  _request: NextRequest,
  handlerConfig: LLMsTxtHandlerConfig,
): Promise<NextResponse> {
  const userPages: PageInfo[] = dedupePagesByRoute(handlerConfig.pages ?? [])
  // Only user-supplied pages flow into the legacy `## Pages` block.
  // Discovered pages live exclusively inside the sectioned output produced
  // by `generateSiteConfig`, preventing the double-render that the
  // previous `[...userPages, ...discoveredPages]` shape caused.
  const pages: PageInfo[] = userPages
  let finalConfig = handlerConfig.defaultConfig

  if (handlerConfig.autoDiscovery) {
    const mergedConfig: RequiredLLMsTxtHandlerConfig = mergeConfig(handlerConfig)
    const discovery = new LLMsTxtAutoDiscovery(mergedConfig)

    const siteConfigFromDiscovery = await discovery.generateSiteConfig()
    const userSections = finalConfig?.sections ?? []
    // `generateSiteConfig` always returns a sections array (the optional
    // marker on `LLMsTxtConfig.sections` is just to keep the public type
    // forgiving for user-supplied configs).
    const discoveredSections = reconcileUserPagesWithSections(
      userPages,
      siteConfigFromDiscovery.sections as LLMsTxtSection[],
      mergedConfig.baseUrl,
    )
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
