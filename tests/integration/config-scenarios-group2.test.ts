import { LLMsTxtAutoDiscovery } from '../../src/discovery'

describe('configuration scenarios - group 2: configuration priority', () => {
  const baseConfig = {
    baseUrl: 'http://localhost:3000',
    appDir: './tests/fixtures/test-project/src/app',
    rootDir: process.cwd(),
  }

  describe('llmstxt priority and extraction', () => {
    it('should use llmstxt config when both llmstxt and metadata exist', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const rootPage = pages.find(p => p.route === '/')

      expect(rootPage).toBeDefined()
      expect(rootPage?.hasLLMsTxtExport).toBe(true)
      expect(rootPage?.config).toBeDefined()

      // Should use llmstxt values, not metadata values
      expect(rootPage?.config?.title).toBe('Next.js LLMs.txt Demo')
      expect(rootPage?.config?.description).toBe('Homepage demonstrating automatic llms.txt generation with comprehensive page discovery')
    })

    it('should extract correct title from llmstxt export', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const servicesPage = pages.find(p => p.route === '/services')

      expect(servicesPage?.config?.title).toBe('Services Overview')
    })

    it('should extract correct description from llmstxt export', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const servicesPage = pages.find(p => p.route === '/services')

      expect(servicesPage?.config?.description).toBe('Complete overview of all available services and solutions')
    })

    it('should preserve config object structure from llmstxt export', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const pages = await discovery.discoverPages()

      const rootPage = pages.find(p => p.route === '/')
      const servicesPage = pages.find(p => p.route === '/services')

      // Both should have valid config objects
      expect(rootPage?.config).toBeDefined()
      expect(rootPage?.config).toHaveProperty('title')
      expect(rootPage?.config).toHaveProperty('description')

      expect(servicesPage?.config).toBeDefined()
      expect(servicesPage?.config).toHaveProperty('title')
      expect(servicesPage?.config).toHaveProperty('description')
    })
  })
})
