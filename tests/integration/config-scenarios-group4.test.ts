import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { createLLmsTxt } from '../../src/handler'
import createMockRequest from '../create-mock-request'

describe('configuration scenarios - group 4: missing configuration handling', () => {
  const baseConfig = {
    baseUrl: 'http://localhost:3000',
    appDir: './tests/fixtures/test-project/src/app',
    rootDir: process.cwd(),
  }

  describe('pages without config', () => {
    it('should detect pages with no config exports', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const noExportAtAllPage = pages.find(p => p.route === '/services/no-export-at-all')

      expect(noExportAtAllPage).toBeDefined()
      expect(noExportAtAllPage?.hasLLMsTxtExport).toBe(false)
      expect(noExportAtAllPage?.hasMetadataFallback).toBe(false)
      expect(noExportAtAllPage?.config).toBeUndefined()
    })

    it('should generate warning for pages without any exports', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const noExportAtAllPage = pages.find(p => p.route === '/services/no-export-at-all')

      expect(noExportAtAllPage?.warnings.length).toBeGreaterThan(0)
      expect(noExportAtAllPage?.warnings.some(w =>
        w.includes('No llms.txt export or metadata found'),
      )).toBe(true)
    })

    it('should NOT include pages without config in site-wide llms.txt', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const siteConfig = await discovery.generateSiteConfig()

      // Flatten all items from all sections
      const allItems = siteConfig.sections?.flatMap(section => section.items) || []
      const urls = allItems.map(item => item.url)

      // Should not include the page without config
      expect(urls).not.toContain('http://localhost:3000/services/no-export-at-all')

      // But should include pages with config
      expect(urls).toContain('http://localhost:3000/')
      expect(urls).toContain('http://localhost:3000/services')
      expect(urls).toContain('http://localhost:3000/services/no-export')
    })

    it('should return 404 for .html.md requests to pages without config', async () => {
      const { GET: handler } = createLLmsTxt({
        defaultConfig: {
          title: 'Test Site',
          description: 'Test description',
        },
        autoDiscovery: baseConfig,
      })

      const request = createMockRequest('/services/no-export-at-all.html.md')
      const response = await handler(request)

      expect(response.status).toBe(404)
    })
  })
})
