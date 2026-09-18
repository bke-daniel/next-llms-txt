import path from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../../src/constants'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { BASE_URL } from '../constants'

/**
 * Regression test for the e2e CI failure: `DEFAULT_CONFIG.autoDiscovery.rootDir`
 * must NOT be a `process.cwd()` value frozen at module-load time. With an unset
 * (empty) rootDir, discovery must resolve paths against the live `process.cwd()`
 * at the moment discovery runs.
 */
const FIXTURE_ROOT = path.resolve(__dirname, '../fixtures/discovery-extras')

describe('discovery rootDir resolution', () => {
  const original = process.cwd()
  afterEach(() => process.chdir(original))

  it('default config autoDiscovery does not freeze an absolute rootDir', () => {
    expect(DEFAULT_CONFIG.autoDiscovery).not.toBe(false)
    if (DEFAULT_CONFIG.autoDiscovery) {
      expect(DEFAULT_CONFIG.autoDiscovery.rootDir).toBe('')
    }
  })

  it('resolves an unset rootDir against the live process.cwd() at discovery time', async () => {
    // Simulate the server starting in the project directory: chdir happens
    // long after this module (and constants.ts) were imported.
    process.chdir(FIXTURE_ROOT)

    const discovery = new LLMsTxtAutoDiscovery({
      baseUrl: BASE_URL,
      defaultConfig: { title: 'Live CWD Site' },
      autoDiscovery: {
        appDir: 'app',
        pagesDir: '',
        rootDir: '', // unset -> must resolve to live cwd
      },
      trailingSlash: false,
      showWarnings: false,
    })

    const pages = await discovery.discoverPages()
    const routes = pages.map(p => p.route)
    expect(routes).toContain('/')
    expect(routes).toContain('/docs')
  })

  it('still honours an explicitly configured absolute rootDir', async () => {
    // cwd is somewhere unrelated; an explicit rootDir must win.
    process.chdir(original)

    const discovery = new LLMsTxtAutoDiscovery({
      baseUrl: BASE_URL,
      defaultConfig: { title: 'Explicit Root Site' },
      autoDiscovery: {
        appDir: 'app',
        pagesDir: '',
        rootDir: FIXTURE_ROOT,
      },
      trailingSlash: false,
      showWarnings: false,
    })

    const pages = await discovery.discoverPages()
    expect(pages.map(p => p.route)).toContain('/docs')
  })
})
