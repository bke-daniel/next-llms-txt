import { NextRequest } from 'next/server'
import { vi } from 'vitest'
import createMarkdownResponse, { DEFAULT_CACHE_CONTROL } from '../../src/create-markdown-response'
import { LLMsTxtConfigError, LLMsTxtError, LLMsTxtGenerationError } from '../../src/errors'
import { createLLmsTxt } from '../../src/handler'
import validateConfig from '../../src/validate-config'
import { AUTO_DISCOVERY, BASE_URL } from '../constants'

describe('P1 Tier 1 — API surface + correctness', () => {
  describe('error classes (P1 #20)', () => {
    it('extends config error from LLMsTxtError and Error', () => {
      const err = new LLMsTxtConfigError('nope')
      expect(err).toBeInstanceOf(LLMsTxtConfigError)
      expect(err).toBeInstanceOf(LLMsTxtError)
      expect(err).toBeInstanceOf(Error)
      expect(err.name).toBe('LLMsTxtConfigError')
    })

    it('extends generation error from LLMsTxtError and Error', () => {
      const err = new LLMsTxtGenerationError('nope')
      expect(err).toBeInstanceOf(LLMsTxtGenerationError)
      expect(err).toBeInstanceOf(LLMsTxtError)
      expect(err.name).toBe('LLMsTxtGenerationError')
    })

    it('validateConfig throws LLMsTxtConfigError, not a bare Error', () => {
      expect(() => validateConfig(undefined as any)).toThrow(LLMsTxtConfigError)
      expect(() => validateConfig({} as any)).toThrow(LLMsTxtConfigError)
    })
  })

  describe('cacheControl override (P1 #22)', () => {
    it('uses the default Cache-Control when no override is supplied', () => {
      const res = createMarkdownResponse('# x')
      expect(res.headers.get('Cache-Control')).toBe(DEFAULT_CACHE_CONTROL)
    })

    it('applies a custom string Cache-Control', () => {
      const res = createMarkdownResponse('# x', 'no-store')
      expect(res.headers.get('Cache-Control')).toBe('no-store')
    })

    it('omits the Cache-Control header entirely when passed false', () => {
      const res = createMarkdownResponse('# x', false)
      expect(res.headers.get('Cache-Control')).toBeNull()
    })

    it('threads through createLLmsTxt → site handler', async () => {
      const handler = createLLmsTxt({
        baseUrl: BASE_URL,
        autoDiscovery: false,
        defaultConfig: { title: 'X' },
        cacheControl: 'private, max-age=60',
      })
      const res = await handler.GET(new NextRequest(`${BASE_URL}/llms.txt`))
      expect(res.headers.get('Cache-Control')).toBe('private, max-age=60')
    })

    it('threads through createLLmsTxt → page handler', async () => {
      const handler = createLLmsTxt({
        baseUrl: BASE_URL,
        autoDiscovery: AUTO_DISCOVERY,
        defaultConfig: { title: 'X' },
        cacheControl: false,
      })
      const res = await handler.GET(new NextRequest(`${BASE_URL}/all-exports.html.md`))
      expect(res.status).toBe(200)
      expect(res.headers.get('Cache-Control')).toBeNull()
    })
  })

  describe('onError hook + structured error logging (P1 #18)', () => {
    it('calls onError with the original Error (stack intact) and still returns 500', async () => {
      const onError = vi.fn()
      const customGenerator = vi.fn(() => {
        throw new Error('blew up inside generator')
      })
      const handler = createLLmsTxt({
        baseUrl: BASE_URL,
        autoDiscovery: false,
        defaultConfig: { title: 'X' },
        generator: customGenerator,
        onError,
      })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const res = await handler.GET(new NextRequest(`${BASE_URL}/llms.txt`))
      expect(res.status).toBe(500)
      expect(onError).toHaveBeenCalledTimes(1)
      const caught = onError.mock.calls[0][0]
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe('blew up inside generator')
      expect((caught as Error).stack).toBeDefined()
      consoleErrorSpy.mockRestore()
    })

    it('still returns 500 even if onError itself throws', async () => {
      const onError = vi.fn(() => {
        throw new Error('onError exploded too')
      })
      const customGenerator = vi.fn(() => {
        throw new Error('first error')
      })
      const handler = createLLmsTxt({
        baseUrl: BASE_URL,
        autoDiscovery: false,
        defaultConfig: { title: 'X' },
        generator: customGenerator,
        onError,
      })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const res = await handler.GET(new NextRequest(`${BASE_URL}/llms.txt`))
      expect(res.status).toBe(500)
      consoleErrorSpy.mockRestore()
    })
  })

  describe('pathname normalization (P1 #16)', () => {
    it('routes /llms.txt/ (trailing slash) to the site handler', async () => {
      const handler = createLLmsTxt({
        baseUrl: BASE_URL,
        autoDiscovery: false,
        defaultConfig: { title: 'Trail' },
      })
      const res = await handler.GET(new NextRequest(`${BASE_URL}/llms.txt/`))
      expect(res.status).toBe(200)
      expect(await res.text()).toContain('# Trail')
    })

    it('routes /llms.txt?foo=bar (query string) to the site handler', async () => {
      const handler = createLLmsTxt({
        baseUrl: BASE_URL,
        autoDiscovery: false,
        defaultConfig: { title: 'QueryOK' },
      })
      const res = await handler.GET(new NextRequest(`${BASE_URL}/llms.txt?foo=bar`))
      expect(res.status).toBe(200)
      expect(await res.text()).toContain('# QueryOK')
    })
  })

  describe('factory-time validation (P1 #11)', () => {
    it('throws LLMsTxtConfigError at construction, not deferred to first GET', () => {
      expect(() => createLLmsTxt({} as any)).toThrow(LLMsTxtConfigError)
    })
  })
})
