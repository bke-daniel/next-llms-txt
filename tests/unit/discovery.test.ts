import path from 'node:path'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'

describe('lLMsTxtAutoDiscovery', () => {
  const testProjectPath = path.join(__dirname, '../fixtures/test-project')

  describe('page Discovery', () => {
    it('should discover all pages in the test project', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: testProjectPath,
      })

      const pages = await discovery.discoverPages()

      expect(pages).toHaveLength(4) // home, services, no-export, no-export-at-all

      const routes = pages.map(p => p.route).sort()
      expect(routes).toEqual([
        '/',
        '/services',
        '/services/no-export',
        '/services/no-export-at-all',
      ])
    })

    it('should correctly identify pages with llmstxt exports', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: testProjectPath,
      })

      const pages = await discovery.discoverPages()

      const homePageInfo = pages.find(p => p.route === '/')
      expect(homePageInfo?.hasLLMsTxtExport).toBe(true)
      expect(homePageInfo?.config?.title).toBe('Next.js LLMs.txt Demo')

      const servicesPageInfo = pages.find(p => p.route === '/services')
      expect(servicesPageInfo?.hasLLMsTxtExport).toBe(true)
      expect(servicesPageInfo?.config?.title).toBe('Services Overview')
    })

    it('should identify pages using metadata fallback', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: testProjectPath,
      })

      const pages = await discovery.discoverPages()

      const noExportPageInfo = pages.find(p => p.route === '/services/no-export')
      expect(noExportPageInfo?.hasLLMsTxtExport).toBe(false)
      expect(noExportPageInfo?.hasMetadataFallback).toBe(true)
      expect(noExportPageInfo?.config?.title).toBe('Service Without Export')
    })

    it('should generate warnings for pages without any exports', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: testProjectPath,
        showWarnings: false, // Disable console output for tests
      })

      const pages = await discovery.discoverPages()

      const noExportAtAllPageInfo = pages.find(p => p.route === '/services/no-export-at-all')
      expect(noExportAtAllPageInfo?.hasLLMsTxtExport).toBe(false)
      expect(noExportAtAllPageInfo?.hasMetadataFallback).toBe(false)
      expect(noExportAtAllPageInfo?.config).toBeUndefined()
      expect(noExportAtAllPageInfo?.warnings).toContainEqual(
        expect.stringContaining('No llms.txt export or metadata found'),
      )
    })

    it('should generate fallback warnings for metadata-only pages', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: testProjectPath,
        showWarnings: false,
      })

      const pages = await discovery.discoverPages()

      const noExportPageInfo = pages.find(p => p.route === '/services/no-export')
      expect(noExportPageInfo?.warnings).toContainEqual(
        expect.stringContaining('Using metadata fallback for llms.txt generation'),
      )
    })
  })

  describe('site Configuration Generation', () => {
    it('should generate comprehensive site configuration', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: testProjectPath,
        showWarnings: false,
      })

      const siteConfig = await discovery.generateSiteConfig()

      expect(siteConfig.title).toBe('Next.js LLMs.txt Demo Site')
      expect(siteConfig.description).toContain('automatic page discovery')
      expect(siteConfig.sections).toHaveLength(2) // Main Pages and Services

      // Check Main Pages section
      const mainPagesSection = siteConfig.sections?.find(s => s.title === 'Main Pages')
      expect(mainPagesSection?.items).toHaveLength(2) // Homepage and services overview
      expect(mainPagesSection?.items[0].url).toBe('https://www.next-llms-txt.com/')

      // Check Services section - may have 1 or 2 items depending on discovery
      const servicesSection = siteConfig.sections?.find(s => s.title === 'Services')
      expect(servicesSection?.items.length).toBeGreaterThan(0) // At least one service

      const serviceUrls = servicesSection?.items.map(item => item.url).sort()
      // Should include services that have either llmstxt export or metadata
      expect(serviceUrls).toContain('https://www.next-llms-txt.com/services/no-export')
    })

    it('should exclude pages without any configuration', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: testProjectPath,
        showWarnings: false,
      })

      const siteConfig = await discovery.generateSiteConfig()

      // no-export-at-all should not be included
      const allUrls = siteConfig.sections
        ?.flatMap(section => section.items)
        .map(item => item.url) || []

      expect(allUrls).not.toContain('https://www.next-llms-txt.com/services/no-export-at-all')
    })
  })

  describe('route Normalization', () => {
    it('should handle trailing slashes correctly', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: testProjectPath,
      })

      const pages = await discovery.discoverPages()

      // All routes should be normalized without trailing slashes (except root)
      const routes = pages.map(p => p.route)

      expect(routes).toContain('/')
      expect(routes).toContain('/services')
      expect(routes).toContain('/services/no-export')
      expect(routes).not.toContain('/services/')
      expect(routes).not.toContain('/services/no-export/')
    })
  })

  describe('error Handling', () => {
    it('should handle missing directories gracefully', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: '/nonexistent/path',
      })

      const pages = await discovery.discoverPages()
      expect(pages).toHaveLength(0)
    })

    it('should collect all warnings during discovery', async () => {
      const discovery = new LLMsTxtAutoDiscovery({
        baseUrl: 'https://www.next-llms-txt.com',
        rootDir: testProjectPath,
        showWarnings: false,
      })

      await discovery.discoverPages()
      const warnings = discovery.getWarnings()

      expect(warnings.length).toBeGreaterThan(0)
      expect(warnings.some(w => w.includes('Using metadata fallback'))).toBe(true)
      expect(warnings.some(w => w.includes('No llms.txt export or metadata found'))).toBe(true)
    })
  })
})
