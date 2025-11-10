import type { LLMsTxtConfig } from '../../src/types'
import { NextRequest } from 'next/server'
import { createLLmsTxt } from '../../src/handler'

describe('createLLmsTxt', () => {
  it('should create handlers with valid config', () => {
    const config: LLMsTxtConfig = {
      title: 'Test Site',
      description: 'A test site for llms.txt',
    }

    const handlers = createLLmsTxt({ defaultConfig: config })

    expect(handlers).toHaveProperty('GET')
    expect(typeof handlers.GET).toBe('function')
  })

  it('should handle handler config with defaultConfig', () => {
    const handlerConfig = {
      defaultConfig: {
        title: 'Test Site',
        description: 'A test site for llms.txt',
      },
    }

    const handlers = createLLmsTxt(handlerConfig)

    expect(handlers).toHaveProperty('GET')
    expect(typeof handlers.GET).toBe('function')
  })

  it('should throw error when handler config has no defaultConfig and no autoDiscovery', () => {
    const handlerConfig = {} as any

    expect(() => createLLmsTxt(handlerConfig)).toThrow(
      'A `defaultConfig` with a `title` or `autoDiscovery` must be provided.',
    )
  })

  describe('get handler', () => {
    const mockRequest = new NextRequest('https://example.com/llms.txt')

    it('should return NextResponse with correct content type and content', async () => {
      const config: LLMsTxtConfig = {
        title: 'Test Site',
        description: 'A test site for llms.txt',
      }

      // Mocking discovered pages instead of relying on filesystem
      const { GET } = createLLmsTxt({
        defaultConfig: config,
        autoDiscovery: {
          rootDir: '/fake-dir', // a fake dir to satisfy the type
          baseUrl: 'https://example.com',
        },
        // Manually pass pages to avoid filesystem discovery in unit test
        pages: [
          {
            path: '/',
            title: 'Homepage',
            description: 'The main landing page',
            fullPath: '/fake-dir/app/page.tsx',
            url: 'https://example.com/',
          },
        ],
      })
      const response = await GET(mockRequest)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')

      const content = await response.text()
      expect(content).toContain('# Test Site')
      expect(content).toContain('> A test site for llms.txt')
      expect(content).toContain('- [Homepage](https://example.com/): The main landing page')
    })

    it('should handle minimal config', async () => {
      const config: LLMsTxtConfig = {
        title: 'Minimal Site',
      }

      const { GET } = createLLmsTxt({ defaultConfig: config })
      const response = await GET(mockRequest)

      expect(response.status).toBe(200)
      const content = await response.text()
      expect(content).toContain('# Minimal Site')
      expect(content).not.toContain('>') // No description
      expect(content).not.toContain('- [') // No pages
    })
  })
})
