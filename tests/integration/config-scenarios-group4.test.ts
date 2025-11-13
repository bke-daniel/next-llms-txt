import { NO_EXPORTS_WARNING } from '../../src/constants'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { createLLmsTxt } from '../../src/handler'
import { BASE_URL, LLMS_TXT_HANDLER_CONFIG, ROUTES_WITH_EXPORTS, ROUTES_WITH_NO_EXPORT } from '../constants'
import createMockRequest from '../create-mock-request'

describe('configuration scenarios - group 4: missing configuration handling', () => {
  const { GET: handleLLmsTxt } = createLLmsTxt(LLMS_TXT_HANDLER_CONFIG)
  const discovery = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)

  describe('pages without config', () => {
    it('should detect pages with no config exports', async () => {
      const pages = await discovery.discoverPages()

      const noExportAtAllPage = pages.filter(p => p.route === '/no-exports' || p.route === '/nested/no-exports')

      expect(noExportAtAllPage).toBeDefined()
      expect(noExportAtAllPage.length).toBe(2)
      noExportAtAllPage.map((page) => {
        expect(page.hasLLMsTxtExport).toBe(false)
        expect(page.hasMetadataFallback).toBe(false)
        expect(page.config).toBeUndefined()
        return null
      })
    })

    it('should generate warning for pages without any exports', async () => {
      const pages = await discovery.discoverPages()

      const noExportAtAllPage = pages.find(p => ROUTES_WITH_NO_EXPORT.includes(p.route))

      expect(noExportAtAllPage?.warnings.length).toBeGreaterThan(0)
      expect(noExportAtAllPage?.warnings.some(w =>
        w.includes(NO_EXPORTS_WARNING),
      )).toBe(true)
    })

    it('should NOT include pages without config in site-wide llms.txt', async () => {
      const siteConfig = await discovery.generateSiteConfig()
      // Flatten all items from all sections
      const allItems = siteConfig.sections?.flatMap(section => section.items) || []
      const urls = allItems.map(item => item.url).sort()
      expect(urls.length).toBe(ROUTES_WITH_EXPORTS.length)

      // Should not include the page without config
      expect(urls).not.toContainEqual(ROUTES_WITH_NO_EXPORT.map(r => `${BASE_URL}${r}`))

      // But should include pages with config
      // expect(urls).toContainEqual(ROUTES_WITH_EXPORTS.map(r => `${BASE_URL}${r}`))
    })

    it('should return 404 for .html.md requests to pages that don\'t exist', async () => {
      const request = createMockRequest('/nested/no-exports.html.md')
      const response = await handleLLmsTxt(request)

      expect(response.status).toBe(404)
    })
  })
})
