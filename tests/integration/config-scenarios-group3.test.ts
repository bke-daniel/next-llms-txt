import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { LLMS_TXT_HANDLER_CONFIG, METADATA } from '../constants'

describe('configuration scenarios - group 3: metadata fallback behavior', () => {
  const discovery = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)

  describe('metadata fallback', () => {
    it('should mark page as using fallback (hasMetadataFallback = true)', async () => {
      const pages = await discovery.discoverPages()
      const noExportPage = pages.find(p => p.route === '/nested/metadata-only')
      expect(noExportPage?.hasLLMsTxtExport).toBe(false)
      expect(noExportPage?.hasMetadataFallback).toBe(true)
      expect(noExportPage?.config?.title).toBe(METADATA.title)
      expect(noExportPage?.config?.description).toBe(METADATA.description)
    })

    it('should generate warning when using metadata fallback', async () => {
      const pages = await discovery.discoverPages()
      const noExportPage = pages.find(p => p.route === '/nested/no-exports')
      expect(noExportPage?.warnings.length).toBeGreaterThan(0)
      expect(noExportPage?.warnings.some(w => w.includes('[next-llms-txt] No llms.txt export or metadata found'))).toBe(true)
    })
  })
})
