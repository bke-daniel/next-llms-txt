import { LLMsTxtAutoDiscovery } from '../../src/discovery'

describe('configuration scenarios - group 1: discovery & export detection', () => {
  const baseConfig = {
    baseUrl: 'http://localhost:3000',
    appDir: './tests/fixtures/test-project/src/app',
    rootDir: process.cwd(),
  }

  describe('export detection', () => {
    it('should discover page with llmstxt export', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const servicesPage = pages.find(p => p.route === '/services')

      expect(servicesPage).toBeDefined()
      expect(servicesPage?.hasLLMsTxtExport).toBe(true)
      expect(servicesPage?.hasMetadataFallback).toBe(false)
      expect(servicesPage?.config).toBeDefined()
      expect(servicesPage?.config?.title).toBe('Services Overview')
    })

    it('should discover page with metadata fallback', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const noExportPage = pages.find(p => p.route === '/services/no-export')

      expect(noExportPage).toBeDefined()
      expect(noExportPage?.hasLLMsTxtExport).toBe(false)
      expect(noExportPage?.hasMetadataFallback).toBe(true)
      expect(noExportPage?.config).toBeDefined()
      expect(noExportPage?.config?.title).toBe('Service Without Export')
    })

    it('should discover page with no exports but generate warning', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const noExportAtAllPage = pages.find(p => p.route === '/services/no-export-at-all')

      expect(noExportAtAllPage).toBeDefined()
      expect(noExportAtAllPage?.hasLLMsTxtExport).toBe(false)
      expect(noExportAtAllPage?.hasMetadataFallback).toBe(false)
      expect(noExportAtAllPage?.config).toBeUndefined()
      expect(noExportAtAllPage?.warnings.length).toBeGreaterThan(0)
      expect(noExportAtAllPage?.warnings[0]).toContain('No llms.txt export or metadata found')
    })

    it('should prefer llmstxt over metadata when both exist', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const rootPage = pages.find(p => p.route === '/')

      expect(rootPage).toBeDefined()
      expect(rootPage?.hasLLMsTxtExport).toBe(true)
      expect(rootPage?.hasMetadataFallback).toBe(false)
      expect(rootPage?.config?.title).toBe('Next.js LLMs.txt Demo')
      // Should use llmstxt description, not metadata description
      expect(rootPage?.config?.description).toContain('comprehensive page discovery')
    })

    it('should discover all pages in the test fixture', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      // Should find: /, /services, /services/no-export, /services/no-export-at-all
      expect(pages.length).toBe(4)

      const routes = pages.map(p => p.route).sort()
      expect(routes).toEqual([
        '/',
        '/services',
        '/services/no-export',
        '/services/no-export-at-all',
      ])
    })
  })
})
