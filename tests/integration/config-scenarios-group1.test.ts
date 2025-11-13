import { NO_EXPORTS_WARNING } from '../../src/constants'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { ALL_ROUTES, LLMS_TXT_HANDLER_CONFIG, LLMSTXT, METADATA } from '../constants'

describe('configuration scenarios - group 1: discovery & export detection', () => {
  const discovery = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)
  describe('export detection', () => {
    it('should discover page with llmstxt export', async () => {
      const pages = await discovery.discoverPages()

      const llmsTxtPage = pages.find(p => p.route === '/llms-txt-only')

      expect(llmsTxtPage).toBeDefined()
      expect(llmsTxtPage?.hasLLMsTxtExport).toBe(true)
      expect(llmsTxtPage?.hasMetadataFallback).toBe(false)
      expect(llmsTxtPage?.config).toBeDefined()
      expect(llmsTxtPage?.config?.title).toBe(LLMSTXT.title)
    })

    it('should discover page with metadata fallback', async () => {
      const pages = await discovery.discoverPages()

      const noExportPage = pages.find(p => p.route === '/nested/metadata-only')

      expect(noExportPage).toBeDefined()
      expect(noExportPage?.hasLLMsTxtExport).toBe(false)
      expect(noExportPage?.hasMetadataFallback).toBe(true)
      expect(noExportPage?.config).toBeDefined()
      expect(noExportPage?.config?.title).toBe(METADATA.title)
    })

    it('should discover page with no exports but generate warning', async () => {
      const pages = await discovery.discoverPages()

      const noExportAtAllPage = pages.find(p => p.route === '/nested/no-exports')

      expect(noExportAtAllPage).toBeDefined()
      expect(noExportAtAllPage?.hasLLMsTxtExport).toBe(false)
      expect(noExportAtAllPage?.hasMetadataFallback).toBe(false)
      expect(noExportAtAllPage?.config).toBeUndefined()
      expect(noExportAtAllPage?.warnings.length).toBeGreaterThan(0)
      expect(noExportAtAllPage?.warnings[0]).toContain(NO_EXPORTS_WARNING)
    })

    it('should prefer llmstxt over metadata when both exist', async () => {
      const pages = await discovery.discoverPages()

      const rootPage = pages.find(p => p.route === '/all-exports')

      expect(rootPage).toBeDefined()
      expect(rootPage?.hasLLMsTxtExport).toBe(true)
      // expect(rootPage?.hasMetadataFallback).toBe(true)
      expect(rootPage?.config?.title).toBe(LLMSTXT.title)
      expect(rootPage?.config?.description).toContain(LLMSTXT.description)
    })

    it('should discover all pages in the test fixture', async () => {
      const pages = await discovery.discoverPages()

      const routes = pages.map(p => p.route).sort()
      expect(routes).toEqual(ALL_ROUTES)
    })
  })
})
