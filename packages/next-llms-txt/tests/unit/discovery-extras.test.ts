import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { BASE_URL } from '../constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '../fixtures/discovery-extras')

function createDiscovery(opts: Partial<{ appDir: string, pagesDir: string }> = {}) {
  return new LLMsTxtAutoDiscovery({
    baseUrl: BASE_URL,
    defaultConfig: { title: 'Extras Site' },
    autoDiscovery: {
      rootDir: ROOT_DIR,
      appDir: opts.appDir ?? 'app',
      pagesDir: opts.pagesDir ?? 'pages',
    },
    trailingSlash: false,
    showWarnings: false,
  })
}

describe('discovery (extras fixture)', () => {
  describe('app-router page entry recognition (P0 #9)', () => {
    it('recognises page.tsx, page.ts, page.jsx, and page.js', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const routes = pages.map(p => p.route).sort()
      expect(routes).toContain('/js-page')
      expect(routes).toContain('/jsx-page')
      expect(routes).toContain('/docs')
      expect(routes).toContain('/')
    })

    it('extracts llmstxt config from a page.jsx', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const jsx = pages.find(p => p.route === '/jsx-page')
      expect(jsx?.config?.title).toBe('JSX Page')
    })

    it('extracts llmstxt config from a page.js', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const js = pages.find(p => p.route === '/js-page')
      expect(js?.config?.title).toBe('JS Page')
    })
  })

  describe('pages-router discovery (P0 #8)', () => {
    it('walks the pages directory and maps files to routes', async () => {
      const discovery = createDiscovery({ appDir: '' })
      const pages = await discovery.discoverPages()
      const routes = pages.map(p => p.route).sort()
      expect(routes).toEqual(['/', '/about', '/blog', '/blog/first-post'])
    })

    it('skips _app, _document, 404, 500, and the api/ directory', async () => {
      const discovery = createDiscovery({ appDir: '' })
      const pages = await discovery.discoverPages()
      const routes = pages.map(p => p.route)
      expect(routes).not.toContain('/_app')
      expect(routes).not.toContain('/404')
      expect(routes).not.toContain('/api/hello')
    })
  })

  describe('app + pages router precedence', () => {
    it('does not double-register a route that exists in both routers', async () => {
      const discovery = createDiscovery()
      const pages = await discovery.discoverPages()
      const rootCount = pages.filter(p => p.route === '/').length
      expect(rootCount).toBe(1)
    })
  })

  describe('generateSiteConfig sectioning (P0 #3)', () => {
    it('groups root-level routes under "Main Pages" and nested routes by first segment', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const siteConfig = await discovery.generateSiteConfig()
      const sectionTitles = siteConfig.sections!.map(s => s.title).sort()
      expect(sectionTitles).toContain('Main Pages')
      expect(sectionTitles).toContain('Docs')
      expect(sectionTitles).toContain('Blog')
    })

    it('puts /docs and /docs/getting-started both under Docs', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const siteConfig = await discovery.generateSiteConfig()
      const docsSection = siteConfig.sections!.find(s => s.title === 'Docs')!
      const urls = docsSection.items.map(i => i.url)
      expect(urls).toContain(`${BASE_URL}/docs/getting-started`)
    })

    it('produces absolute URLs using the configured baseUrl', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const siteConfig = await discovery.generateSiteConfig()
      const allUrls = siteConfig.sections!.flatMap(s => s.items.map(i => i.url))
      for (const url of allUrls) {
        expect(url.startsWith(BASE_URL)).toBe(true)
      }
    })
  })

  describe('metadata title coercion (P0 #4)', () => {
    it('extracts a string title from object-shaped metadata.title via `default`', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const page = pages.find(p => p.route === '/object-title-metadata')
      expect(page?.hasMetadataFallback).toBe(true)
      expect(page?.config?.title).toBe('Object-shaped Title')
    })
  })

  describe('pages-router non-page file filtering (QA must-fix)', () => {
    it('skips *.test.*, _meta-style underscore files, and *.d.ts type-declarations', async () => {
      const discovery = createDiscovery({ appDir: '' })
      const pages = await discovery.discoverPages()
      const routes = pages.map(p => p.route)

      // None of these synthetic siblings should ever appear as routes.
      expect(routes).not.toContain('/about.test')
      expect(routes).not.toContain('/_meta')
      expect(routes).not.toContain('/meta')
      expect(routes).not.toContain('/feature.d')
      expect(routes).not.toContain('/feature')
    })
  })
})
