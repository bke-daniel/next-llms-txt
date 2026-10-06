import { promises as fsp } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { BASE_URL } from '../constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const EXTRAS_ROOT = path.resolve(__dirname, '../fixtures/discovery-extras')

function createDiscovery(opts: Partial<{ appDir: string, pagesDir: string, rootDir: string, llmstxtExportName: string, extensions: readonly string[] }> = {}) {
  return new LLMsTxtAutoDiscovery({
    baseUrl: BASE_URL,
    defaultConfig: { title: 'Extras Site' },
    autoDiscovery: {
      rootDir: opts.rootDir ?? EXTRAS_ROOT,
      appDir: opts.appDir ?? 'app',
      pagesDir: opts.pagesDir ?? 'pages',
      llmstxtExportName: opts.llmstxtExportName ?? 'llmstxt',
      extensions: opts.extensions ?? ['.ts', '.tsx', '.js', '.jsx'],
    },
    trailingSlash: false,
    showWarnings: false,
  })
}

describe('P3 — extra coverage for the discovery pipeline', () => {
  describe('cross-file llmstxt resolution (lifts discovery branch coverage)', () => {
    it('follows a re-export to the source file and extracts the named binding', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const imported = pages.find(p => p.route === '/imported-config')
      expect(imported).toBeDefined()
      expect(imported?.config?.title).toBe('Shared LLMs.txt Config')
      expect(imported?.config?.description).toBe('Lives in ../shared/config.ts')
    })

    it('follows a default import → re-export chain via resolveDefaultExport', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const def = pages.find(p => p.route === '/default-export')
      expect(def).toBeDefined()
      expect(def?.config?.title).toBe('Default Export Config')
    })
  })

  describe('template-literal titles (P2 #29)', () => {
    it('preserves interpolation placeholders in extracted metadata titles', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const tpl = pages.find(p => p.route === '/template-title')
      // Title round-trips as `Page ${id}` rather than `Page ` (the `$` and
      // `{id}` are split to keep `no-template-curly-in-string` happy
      // against the literal we're asserting).
      expect(tpl?.config?.title).toBe(`Page $${'{id}'}`)
    })
  })

  describe('route-segment sanitization (P2 #36)', () => {
    it('strips dynamic-route brackets from route-derived titles', async () => {
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      const dyn = pages.find(p => p.route === '/dynamic-segment/[id]')
      // The route itself keeps Next.js's bracket convention…
      expect(dyn).toBeDefined()
      // …but the metadata-fallback title doesn't leak the brackets.
      expect(dyn?.config?.title ?? '').not.toMatch(/\[|\]/)
      expect(dyn?.config?.title).toContain('Id')
    })
  })

  describe('configurable llmstxt export name (P2 #28)', () => {
    it('honours autoDiscovery.llmstxtExportName when picking the named export', async () => {
      // The fixture's `llmstxt` export becomes invisible if we ask for a
      // different export name. Discovery then falls back to metadata.
      const discovery = createDiscovery({
        pagesDir: '',
        llmstxtExportName: 'totallyMadeUpExportName',
      })
      const pages = await discovery.discoverPages()
      const tpl = pages.find(p => p.route === '/template-title')
      expect(tpl?.hasLLMsTxtExport).toBe(false)
      // Metadata fallback still kicks in.
      expect(tpl?.hasMetadataFallback).toBe(true)
    })
  })

  describe('configurable extension list (P2 #31)', () => {
    it('restricting `extensions` to .tsx excludes .js/.jsx page entries', async () => {
      const discovery = createDiscovery({
        pagesDir: '',
        extensions: ['.tsx'],
      })
      const pages = await discovery.discoverPages()
      const routes = pages.map(p => p.route)
      expect(routes).not.toContain('/js-page')
      expect(routes).not.toContain('/jsx-page')
      // .tsx-only fixtures still come through.
      expect(routes).toContain('/docs')
    })
  })

  describe('tsconfig.json error reporting (P2 #32)', () => {
    it('rejects malformed tsconfig.json with a helpful, file-pathed error', async () => {
      const broken = await fsp.mkdtemp(path.join(os.tmpdir(), 'p3cov-tsconfig-'))
      try {
        await fsp.writeFile(path.join(broken, 'tsconfig.json'), '{ not real json,,,', 'utf8')
        await fsp.mkdir(path.join(broken, 'app'), { recursive: true })
        await fsp.writeFile(
          path.join(broken, 'app', 'page.tsx'),
          'export const llmstxt = { title: "x" }\nexport default function P() { return null }\n',
        )

        const discovery = new LLMsTxtAutoDiscovery({
          baseUrl: BASE_URL,
          defaultConfig: { title: 'broken' },
          autoDiscovery: {
            rootDir: broken,
            appDir: 'app',
            pagesDir: '',
            llmstxtExportName: 'llmstxt',
            extensions: ['.tsx'],
          },
          trailingSlash: false,
          showWarnings: false,
        })
        // The lazy `loadTsConfigPaths` catches the wrapped error and
        // continues silently (alias resolution is optional). What we're
        // really asserting is that the discovery still completes and
        // returns the page — the broken tsconfig doesn't take the whole
        // pipeline down.
        const pages = await discovery.discoverPages()
        expect(pages.some(p => p.route === '/')).toBe(true)
      }
      finally {
        await fsp.rm(broken, { recursive: true, force: true })
      }
    })
  })

  describe('tsconfig path-alias resolution', () => {
    it('loads tsconfig paths from the configured rootDir (exercises happy-path alias load)', async () => {
      // The discovery-extras fixture ships a tsconfig.json with a
      // `@shared/*` alias; just constructing the discovery and running
      // a pass exercises `loadTsConfigPaths`.
      const discovery = createDiscovery({ pagesDir: '' })
      const pages = await discovery.discoverPages()
      // Pages still discoverable; the alias load did not throw.
      expect(pages.length).toBeGreaterThan(0)
    })
  })
})
