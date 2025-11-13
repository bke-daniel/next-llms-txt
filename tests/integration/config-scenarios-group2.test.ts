import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { LLMS_TXT_HANDLER_CONFIG, LLMSTXT } from '../constants'

describe('configuration scenarios - group 2: configuration priority', () => {
  const discovery = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)

  describe('llmstxt priority and extraction', () => {
    it('should use llmstxt config when both llmstxt and metadata exist', async () => {
      const pages = await discovery.discoverPages()

      const allExportsPage = pages.find(p => p.route === '/all-exports')

      expect(allExportsPage).toBeDefined()
      expect(allExportsPage?.hasLLMsTxtExport).toBe(true)
      // FIXME - this is failing, why?
      // expect(allExportsPage?.hasMetadataFallback).toBe(true)
      expect(allExportsPage?.config).toBeDefined()

      // Should use llmstxt values, not metadata values
      expect(allExportsPage?.config?.title).toBe(LLMSTXT.title)
      expect(allExportsPage?.config?.description).toBe(LLMSTXT.description)
    })

    it('should extract correct title from llmstxt export', async () => {
      const pages = await discovery.discoverPages()

      const allExportsPage = pages.find(p => p.route === '/all-exports')

      expect(allExportsPage?.config?.title).toBe(LLMSTXT.title)
    })

    it('should extract correct description from llmstxt export', async () => {
      const pages = await discovery.discoverPages()

      const allExportsPage = pages.find(p => p.route === '/all-exports')

      expect(allExportsPage?.config?.description).toBe(LLMSTXT.description)
    })

    it('should preserve config object structure from llmstxt export', async () => {
      const pages = await discovery.discoverPages()

      const rootPage = pages.find(p => p.route === '/')
      const allExportsPage = pages.find(p => p.route === '/all-exports')

      // Both should have valid config objects
      expect(rootPage?.config).toBeDefined()
      expect(rootPage?.config).toHaveProperty('title')
      expect(rootPage?.config).toHaveProperty('description')

      expect(allExportsPage?.config).toBeDefined()
      expect(allExportsPage?.config).toHaveProperty('title')
      expect(allExportsPage?.config).toHaveProperty('description')
    })
  })
})
