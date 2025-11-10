import { LLMsTxtAutoDiscovery } from '../../src/discovery'

describe('configuration scenarios - group 3: metadata fallback behavior', () => {
  const baseConfig = {
    baseUrl: 'http://localhost:3000',
    appDir: './tests/fixtures/test-project/src/app',
    rootDir: process.cwd(),
  }

  describe('metadata fallback', () => {
    it('should fallback to metadata.title when llmstxt is missing', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const noExportPage = pages.find(p => p.route === '/services/no-export')

      expect(noExportPage?.config?.title).toBe('Service Without Export')
    })

    it('should fallback to metadata.description when llmstxt is missing', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const noExportPage = pages.find(p => p.route === '/services/no-export')

      expect(noExportPage?.config?.description).toBe('This service uses metadata fallback for llms.txt generation')
    })

    it('should mark page as using fallback (hasMetadataFallback = true)', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const noExportPage = pages.find(p => p.route === '/services/no-export')

      expect(noExportPage?.hasMetadataFallback).toBe(true)
      expect(noExportPage?.hasLLMsTxtExport).toBe(false)
    })

    it('should generate warning when using metadata fallback', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const noExportPage = pages.find(p => p.route === '/services/no-export')

      expect(noExportPage?.warnings.length).toBeGreaterThan(0)
      expect(noExportPage?.warnings.some(w => w.includes('metadata fallback'))).toBe(true)
    })
  })
})
