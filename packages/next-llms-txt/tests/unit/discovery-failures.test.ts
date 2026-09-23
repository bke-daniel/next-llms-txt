import { promises as fsp } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { LLMsTxtError } from '../../src/errors'
import { createLLmsTxt } from '../../src/handler'
import mergeConfig from '../../src/merge-with-default-config'
import { BASE_URL } from '../constants'
import createMockRequest from '../create-mock-request'

/**
 * Failures during discovery must be visible (#51 items 5 and 6): a page that
 * cannot be parsed is reported through `onError` and the log even in
 * production, and a project whose discovery directories do not exist is
 * warned about regardless of `showWarnings`.
 */
describe('discovery failure reporting', () => {
  let root: string
  let onError: ReturnType<typeof vi.fn>
  let consoleError: ReturnType<typeof vi.spyOn>
  let consoleWarn: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    root = await fsp.mkdtemp(path.join(os.tmpdir(), 'next-llms-txt-failures-'))
    onError = vi.fn()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(async () => {
    consoleError.mockRestore()
    consoleWarn.mockRestore()
    await fsp.rm(root, { recursive: true, force: true })
  })

  async function writePage(relativeDir: string, source: string): Promise<void> {
    const dir = path.join(root, relativeDir)
    await fsp.mkdir(dir, { recursive: true })
    await fsp.writeFile(path.join(dir, 'page.tsx'), source)
  }

  function handlerConfig() {
    return {
      baseUrl: BASE_URL,
      defaultConfig: { title: 'Failures Site' },
      autoDiscovery: { rootDir: root, appDir: 'src/app', pagesDir: '' },
      // Production-like: advisories are silent. Failures must not be.
      showWarnings: false,
      onError,
    }
  }

  describe('a page file that cannot be parsed (item 5)', () => {
    beforeEach(async () => {
      await writePage('src/app', `export const llmstxt = { title: 'Home' }\nexport default function Page() { return null }\n`)
      await writePage('src/app/broken', `export const llmstxt = { title: 'Broken' }\nexport default function Page() { return <div> }\n`)
    })

    it('is reported through onError as an LLMsTxtError naming the file, with the parse error as cause', async () => {
      const discovery = new LLMsTxtAutoDiscovery(mergeConfig(handlerConfig()))
      const pages = await discovery.discoverPages()

      expect(pages.map(p => p.route).sort()).toEqual(['/', '/broken'])
      expect(pages.find(p => p.route === '/broken')?.config).toBeUndefined()

      expect(onError).toHaveBeenCalledTimes(1)
      const error = onError.mock.calls[0][0]
      expect(error).toBeInstanceOf(LLMsTxtError)
      expect(error.message).toContain(path.join('src', 'app', 'broken', 'page.tsx'))
      expect(error.message).toContain('(/broken)')
      expect((error as { cause?: unknown }).cause).toBeInstanceOf(SyntaxError)

      expect(discovery.getFailedPages().get('/broken')).toBe(error)
    })

    it('is logged with console.error even though showWarnings is off', async () => {
      const discovery = new LLMsTxtAutoDiscovery(mergeConfig(handlerConfig()))
      await discovery.discoverPages()

      expect(consoleError).toHaveBeenCalledTimes(1)
      expect(consoleError.mock.calls[0][0]).toContain('Auto-discovery failed for a page')
      expect(consoleWarn).not.toHaveBeenCalled()
    })

    it('keeps /llms.txt working without the broken page', async () => {
      const { GET } = createLLmsTxt(handlerConfig())
      const response = await GET(createMockRequest('/llms.txt'))

      expect(response.status).toBe(200)
      const body = await response.text()
      expect(body).toContain(`${BASE_URL}/`)
      expect(body).not.toContain('/broken')
    })

    it('answers 500, not 404, for the broken page route', async () => {
      const { GET } = createLLmsTxt(handlerConfig())

      const broken = await GET(createMockRequest('/broken.html.md'))
      expect(broken.status).toBe(500)
      expect(await broken.text()).toContain('could not be analysed')

      const missing = await GET(createMockRequest('/never-existed.html.md'))
      expect(missing.status).toBe(404)
    })
  })

  describe('discovery directories that do not exist (item 6)', () => {
    it('warns regardless of showWarnings, naming the resolved directories', async () => {
      // The project keeps `app/` at the repository root, but the default
      // configuration looks in `src/app`.
      await writePage('app', `export const llmstxt = { title: 'Root app' }\n`)
      const discovery = new LLMsTxtAutoDiscovery(mergeConfig({
        ...handlerConfig(),
        autoDiscovery: { rootDir: root },
      }))

      const pages = await discovery.discoverPages()

      expect(pages).toEqual([])
      expect(consoleWarn).toHaveBeenCalledTimes(1)
      const message = consoleWarn.mock.calls[0][0] as string
      expect(message).toContain('found none of the configured directories')
      expect(message).toContain(path.join(root, 'src', 'app'))
      expect(message).toContain(path.join(root, 'src', 'pages'))
      expect(discovery.getWarnings()).toEqual([message])
      // A missing directory is a configuration problem, not a request failure.
      expect(onError).not.toHaveBeenCalled()
    })

    it('does not warn when at least one configured directory exists', async () => {
      await writePage('src/app', `export const llmstxt = { title: 'Home' }\n`)
      const discovery = new LLMsTxtAutoDiscovery(mergeConfig({
        ...handlerConfig(),
        autoDiscovery: { rootDir: root },
      }))

      await discovery.discoverPages()

      expect(consoleWarn).not.toHaveBeenCalled()
    })

    it('rethrows when a configured directory exists but cannot be read', async () => {
      if (process.platform === 'win32' || process.getuid?.() === 0)
        return // permission bits are not enforced for root or on Windows

      // Removing search permission from the parent makes even `stat` of
      // `src/app` fail, which is the check that used to swallow every error.
      const srcDir = path.join(root, 'src')
      await fsp.mkdir(path.join(srcDir, 'app'), { recursive: true })
      await fsp.chmod(srcDir, 0o000)
      const discovery = new LLMsTxtAutoDiscovery(mergeConfig(handlerConfig()))

      try {
        await expect(discovery.discoverPages()).rejects.toMatchObject({ code: 'EACCES' })
        expect(consoleWarn).not.toHaveBeenCalled()
      }
      finally {
        await fsp.chmod(srcDir, 0o755)
      }
    })
  })
})
