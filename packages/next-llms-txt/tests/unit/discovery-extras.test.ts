import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { createLLmsTxt } from '../../src/handler'
import { BASE_URL } from '../constants'
import createMockRequest from '../create-mock-request'

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

    it('puts /docs under "Main Pages" and /docs/getting-started under "Docs"', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const siteConfig = await discovery.generateSiteConfig()
      const urlsOf = (title: string) =>
        siteConfig.sections!.find(s => s.title === title)!.items.map(i => i.url)

      // Only routes with two or more segments get their own section; a
      // single-segment route is root-level, even when it has child routes.
      expect(urlsOf('Docs')).toEqual([`${BASE_URL}/docs/getting-started`])
      expect(urlsOf('Main Pages')).toContain(`${BASE_URL}/docs`)
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

  describe('app-router special directories (#51 items 1, 2)', () => {
    it('strips route groups from the URL instead of skipping their pages', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const pricing = pages.find(p => p.route === '/pricing')
      expect(pricing?.config?.title).toBe('Pricing')
      expect(pricing?.filePath).toContain('(marketing)')
      // Nested groups collapse the same way.
      expect(pages.find(p => p.route === '/team')?.config?.title).toBe('Team')
      // The group name never becomes a segment.
      expect(pages.map(p => p.route).some(r => r.includes('('))).toBe(false)
    })

    it('does not list intercepting routes or parallel-route slots', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const titles = pages.map(p => p.config?.title)
      expect(titles).not.toContain('Intercepted pricing')
      expect(titles).not.toContain('Login modal')
      expect(pages.map(p => p.route).some(r => r.includes('@'))).toBe(false)
    })
  })

  describe('llmstxt export shapes (#51 items 3, 4)', () => {
    it('reads an export declared with `satisfies`', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const page = pages.find(p => p.route === '/satisfies-config')
      expect(page?.hasLLMsTxtExport).toBe(true)
      expect(page?.config).toEqual({ title: 'Satisfies Config', description: 'Declared with `satisfies`' })
    })

    it('reads an export declared with `as const`, including nested arrays', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const page = pages.find(p => p.route === '/as-const-config')
      expect(page?.config?.title).toBe('As Const Config')
      expect(page?.config?.sections).toEqual([{ title: 'Links', items: [{ title: 'Docs', url: '/docs' }] }])
    })

    it('resolves property values that are identifiers declared in the same file', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const page = pages.find(p => p.route === '/identifier-title')
      expect(page?.config?.title).toBe('Identifier Title')
      // Template interpolations stay visible as placeholders (see extractValue).
      // eslint-disable-next-line no-template-curly-in-string
      expect(page?.config?.description).toBe('Description for ${PAGE_TITLE}')
    })

    it('falls back to a route-derived title when the title cannot be read statically', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const page = pages.find(p => p.route === '/unresolvable-title')
      expect(page?.hasLLMsTxtExport).toBe(true)
      expect(page?.config?.title).toBe('Unresolvable-title')
      expect(page?.config?.description).toBe('Title comes from a function call')
      expect(page?.warnings?.join('\n')).toContain('no static string title')
    })

    it('serves the page route with a 200 instead of a 500 when the title is unresolvable', async () => {
      const { GET } = createLLmsTxt({
        baseUrl: BASE_URL,
        defaultConfig: { title: 'Extras Site' },
        autoDiscovery: { rootDir: ROOT_DIR, appDir: 'app', pagesDir: '' },
        showWarnings: false,
      })
      const response = await GET(createMockRequest('/unresolvable-title.html.md'))
      expect(response.status).toBe(200)
      expect(await response.text()).toContain('# Unresolvable-title')

      const site = await GET(createMockRequest('/llms.txt'))
      expect(await site.text()).toContain(`${BASE_URL}/unresolvable-title`)
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
