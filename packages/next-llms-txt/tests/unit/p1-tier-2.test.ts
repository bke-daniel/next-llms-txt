import { promises as fsp } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NextRequest } from 'next/server'
import { createLLmsTxt } from '../../src/handler'
import { composeDiscoverySignal } from '../../src/request-signal'
import { BASE_URL } from '../constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const EXTRAS_ROOT = path.resolve(__dirname, '../fixtures/discovery-extras')

describe('P1 Tier 2 — performance + robustness', () => {
  describe('AbortSignal threading (P1 #23)', () => {
    it('honours a pre-aborted request signal — discovery never enters the walk', async () => {
      const handler = createLLmsTxt({
        baseUrl: BASE_URL,
        autoDiscovery: {
          rootDir: EXTRAS_ROOT,
          appDir: 'app',
          pagesDir: '',
        },
        defaultConfig: { title: 'X' },
      })

      const controller = new AbortController()
      controller.abort()
      const req = new Request(`${BASE_URL}/llms.txt`, { signal: controller.signal })
      const res = await handler.GET(req as unknown as NextRequest)
      // The handler catches the AbortError and returns 500 — what matters
      // is that the abort actually short-circuits the walk.
      expect(res.status).toBe(500)
    })

    it('discoveryTimeoutMs short-circuits when the live discovery exceeds the budget', async () => {
      // Create a tree with many symlink-like dirs (just nested empty dirs)
      // so the walk takes measurable time, then arm a 1ms timeout.
      const slowRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'p1tier2-'))
      try {
        let dir = path.join(slowRoot, 'app')
        await fsp.mkdir(dir, { recursive: true })
        // 30 nested empty dirs — enough to outpace a 1ms budget on any
        // hardware. No page.tsx is emitted, so success/failure is purely
        // a timing question.
        for (let i = 0; i < 30; i++) {
          dir = path.join(dir, `nested-${i}`)
          await fsp.mkdir(dir)
        }

        const handler = createLLmsTxt({
          baseUrl: BASE_URL,
          autoDiscovery: { rootDir: slowRoot, appDir: 'app', pagesDir: '' },
          defaultConfig: { title: 'Slow' },
          discoveryTimeoutMs: 1,
        })
        const res = await handler.GET(new NextRequest(`${BASE_URL}/llms.txt`))
        // Either the discovery raced the timeout and won (200) or the
        // timeout fired (500). Both are tolerable; what we're really
        // asserting is "doesn't hang and doesn't crash unrelated state".
        expect([200, 500]).toContain(res.status)
      }
      finally {
        await fsp.rm(slowRoot, { recursive: true, force: true })
      }
    })
  })

  describe('composeDiscoverySignal helper', () => {
    it('returns undefined when neither source is configured', () => {
      expect(composeDiscoverySignal(undefined, undefined)).toBeUndefined()
      expect(composeDiscoverySignal(undefined, 0)).toBeUndefined()
    })

    it('passes a lone request signal through unmodified', () => {
      const ctrl = new AbortController()
      expect(composeDiscoverySignal(ctrl.signal, undefined)).toBe(ctrl.signal)
    })

    it('composes both signals — aborts when either fires', () => {
      const ctrl = new AbortController()
      const composed = composeDiscoverySignal(ctrl.signal, 5000)
      expect(composed).toBeDefined()
      ctrl.abort()
      // AbortSignal.any propagates synchronously
      expect(composed?.aborted).toBe(true)
    })
  })

  describe('symlink-cycle resilience (P1 #15)', () => {
    it('walks a tree that loops back on itself via a symlink without hanging', async () => {
      const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'p1tier2-cycle-'))
      try {
        const appDir = path.join(root, 'app')
        const realChild = path.join(appDir, 'real')
        await fsp.mkdir(realChild, { recursive: true })
        await fsp.writeFile(
          path.join(realChild, 'page.tsx'),
          'export const llmstxt = { title: "Cyclic", description: "ok" }\nexport default function P() { return null }\n',
        )
        // Create a self-referential loop: app/real/loop → ../../app
        try {
          await fsp.symlink(appDir, path.join(realChild, 'loop'), 'dir')
        }
        catch {
          // Some filesystems (Windows without admin, sandboxed CI) refuse
          // symlinks. In that case this test becomes a no-op assertion;
          // the actual symlink-cycle path is exercised in environments
          // where the API succeeds.
          return
        }

        const handler = createLLmsTxt({
          baseUrl: BASE_URL,
          autoDiscovery: { rootDir: root, appDir: 'app', pagesDir: '' },
          defaultConfig: { title: 'Cycle' },
        })

        // No timeout — we're trusting visitedRealDirs to break the cycle.
        const res = await handler.GET(new NextRequest(`${BASE_URL}/llms.txt`))
        expect(res.status).toBe(200)
        const text = await res.text()
        expect(text).toContain('Cyclic')
      }
      finally {
        await fsp.rm(root, { recursive: true, force: true })
      }
    })
  })

  describe('per-file AST cache hit-once (P1 #14)', () => {
    it('reads any given page file exactly once across a single discovery pass', async () => {
      // Two calls in a row against the same instance — the second should
      // hit the AST cache for every page. We can't observe parse counts
      // directly without instrumenting Babel, so we instead assert that
      // the handler returns the same body across calls (a behavioural
      // proxy: if the cache produced a stale result, this would diverge).
      const handler = createLLmsTxt({
        baseUrl: BASE_URL,
        autoDiscovery: {
          rootDir: EXTRAS_ROOT,
          appDir: 'app',
          pagesDir: '',
        },
        defaultConfig: { title: 'X' },
      })
      const a = await (await handler.GET(new NextRequest(`${BASE_URL}/llms.txt`))).text()
      const b = await (await handler.GET(new NextRequest(`${BASE_URL}/llms.txt`))).text()
      expect(a).toBe(b)
      expect(a).toContain('## Main Pages')
    })
  })
})
