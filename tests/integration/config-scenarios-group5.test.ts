import { LLMsTxtAutoDiscovery } from '../../src/discovery'

describe('configuration scenarios - group 5: site-wide generation', () => {
  const baseConfig = {
    baseUrl: 'http://localhost:3000',
    appDir: './tests/fixtures/test-project/src/app',
    rootDir: process.cwd(),
  }

  describe('site-wide llms.txt generation', () => {
    it('should include pages with llmstxt in site-wide file', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const siteConfig = await discovery.generateSiteConfig()

      const allItems = siteConfig.sections?.flatMap(section => section.items) || []
      const urls = allItems.map(item => item.url)

      expect(urls).toContain('http://localhost:3000/')
      expect(urls).toContain('http://localhost:3000/services')
    })

    it('should include pages with metadata fallback in site-wide file', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const siteConfig = await discovery.generateSiteConfig()

      const allItems = siteConfig.sections?.flatMap(section => section.items) || []
      const urls = allItems.map(item => item.url)

      expect(urls).toContain('http://localhost:3000/services/no-export')
    })

    it('should exclude pages without any config from site-wide file', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const siteConfig = await discovery.generateSiteConfig()

      const allItems = siteConfig.sections?.flatMap(section => section.items) || []
      const urls = allItems.map(item => item.url)

      expect(urls).not.toContain('http://localhost:3000/services/no-export-at-all')
    })

    it('should group pages by route structure (Main Pages vs Services)', async () => {
      const discovery = new LLMsTxtAutoDiscovery(baseConfig)
      const siteConfig = await discovery.generateSiteConfig()

      expect(siteConfig.sections).toBeDefined()
      expect(siteConfig.sections?.length).toBeGreaterThan(0)

      const sectionTitles = siteConfig.sections?.map(s => s.title) || []
      expect(sectionTitles).toContain('Main Pages')
      expect(sectionTitles).toContain('Services')

      // Find the sections
      const mainPagesSection = siteConfig.sections?.find(s => s.title === 'Main Pages')
      const servicesSection = siteConfig.sections?.find(s => s.title === 'Services')

      // Main Pages should contain root route and /services
      const mainPageUrls = mainPagesSection?.items.map(i => i.url) || []
      expect(mainPageUrls).toContain('http://localhost:3000/')
      expect(mainPageUrls).toContain('http://localhost:3000/services')

      // Services section should contain nested /services/* routes
      const serviceUrls = servicesSection?.items.map(i => i.url) || []
      expect(serviceUrls).toContain('http://localhost:3000/services/no-export')
    })
  })
})
