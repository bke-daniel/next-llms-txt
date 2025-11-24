import type { LLMsTxtConfig, LLMsTxtItem } from '../../src/types'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { BASE_URL, LLMS_TXT_HANDLER_CONFIG, ROUTES_WITH_EXPORTS, ROUTES_WITH_NO_EXPORT } from '../constants'

describe('configuration scenarios - group 5: site-wide generation', () => {
  const discovery = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)

  describe('site-wide llms.txt generation', () => {
    // @ts-expect-error fine for this test
    let siteConfig: LLMsTxtConfig = { sections: [] }
    let allItems: LLMsTxtItem[] = []
    let urls: string[] = []
    beforeAll(async () => {
      siteConfig = await discovery.generateSiteConfig()
      allItems = siteConfig.sections?.flatMap(section => section.items) || []
      urls = allItems.map(item => item.url).sort()
    })

    it('should include pages with llmstxt in site-wide file', async () => {
      ROUTES_WITH_EXPORTS.forEach((route) => {
        expect(urls).toContain(BASE_URL + route)
      })
    })

    it('should include pages with metadata fallback in site-wide file', async () => {
      const urls = allItems.map(item => item.url)
      ROUTES_WITH_EXPORTS.forEach((route) => {
        expect(urls).toContain(BASE_URL + route)
      })
    })

    it('should exclude pages without any config from site-wide file', async () => {
      const urls = allItems.map(item => item.url)
      expect(urls).not.toContain(ROUTES_WITH_NO_EXPORT.map(r => BASE_URL + r))
    })
  })
})
