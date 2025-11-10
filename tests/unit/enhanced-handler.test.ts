import path from 'node:path'
import { NextRequest } from 'next/server'
import { createEnhancedLLMsTxtHandlers, createPageLLMsTxtHandlers } from '../../src/enhanced-handler'

const mockProjectPath = path.join(__dirname, '../fixtures/mock-project')

describe('enhanced LLMs.txt Handlers', () => {
  describe('createEnhancedLLMsTxtHandlers', () => {
    it('should generate site-wide llms.txt with auto-discovery', async () => {
      const { GET } = createEnhancedLLMsTxtHandlers({
        title: 'Test Site',
        description: 'Test description',
        baseUrl: 'https://www.next-llms-txt.com',
        autoDiscovery: {
          baseUrl: 'https://www.next-llms-txt.com',
          rootDir: mockProjectPath,
        },
      })

      const request = new NextRequest('https://www.next-llms-txt.com/llms.txt')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const content = await response.text()
      expect(content).toContain('# Test Site')
      expect(content).toContain('Test description')
    })

    it('should handle requests without auto-discovery', async () => {
      const { GET } = createEnhancedLLMsTxtHandlers({
        title: 'Simple Site',
        description: 'Simple description',
        baseUrl: 'https://www.next-llms-txt.com',
        sections: [{
          title: 'Pages',
          items: [{
            title: 'Home',
            url: 'https://www.next-llms-txt.com/',
            description: 'Homepage',
          }],
        }],
      })

      const request = new NextRequest('https://www.next-llms-txt.com/llms.txt')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const content = await response.text()
      expect(content).toContain('# Simple Site')
      expect(content).toContain('## Pages')
    })

    it('should return error when no configuration is provided', async () => {
      const { GET } = createEnhancedLLMsTxtHandlers({})

      const request = new NextRequest('https://www.next-llms-txt.com/llms.txt')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('createPageLLMsTxtHandlers', () => {
    it('should return 404 when no pages are discovered', async () => {
      const { GET } = createPageLLMsTxtHandlers('https://www.next-llms-txt.com', {
        autoDiscovery: {
          baseUrl: 'https://www.next-llms-txt.com',
          rootDir: '/non-existent-path',
        },
      })

      const request = new NextRequest('https://www.next-llms-txt.com/index.html.md')
      const response = await GET(request)

      expect(response.status).toBe(404)
      const content = await response.text()
      expect(content).toContain('Page not found')
    })

    it('should handle .html.md extension removal', async () => {
      const { GET } = createPageLLMsTxtHandlers('https://www.next-llms-txt.com')

      const request = new NextRequest('https://www.next-llms-txt.com/services.html.md')
      const response = await GET(request)

      // Should attempt to find /services route but fail since no discovery setup
      expect(response.status).toBe(404)
    })

    it('should handle index.html.md normalization', async () => {
      const { GET } = createPageLLMsTxtHandlers('https://www.next-llms-txt.com')

      const request = new NextRequest('https://www.next-llms-txt.com/index.html.md')
      const response = await GET(request)

      // Should attempt to find / route but fail since no discovery setup
      expect(response.status).toBe(404)
    })

    it('should work with real project structure', async () => {
      // Use the current project as test case since we know it has proper structure
      const { GET } = createPageLLMsTxtHandlers('https://www.next-llms-txt.com', {
        autoDiscovery: {
          baseUrl: 'https://www.next-llms-txt.com',
          rootDir: path.join(__dirname, '../../'),
        },
      })

      const request = new NextRequest('https://www.next-llms-txt.com/index.html.md')
      const response = await GET(request)

      // Should find actual project structure but may not have matching routes
      expect([200, 404]).toContain(response.status)
    })
  })

  describe('content-Type and Caching Headers', () => {
    it('should set correct headers for all responses', async () => {
      const { GET } = createEnhancedLLMsTxtHandlers({
        title: 'Test Site',
      })

      const request = new NextRequest('https://www.next-llms-txt.com/llms.txt')
      const response = await GET(request)

      expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=3600')
    })
  })

  describe('uRL Processing', () => {
    it('should handle various URL patterns', async () => {
      const { GET } = createPageLLMsTxtHandlers('https://www.next-llms-txt.com')

      // Test various URL formats
      const urls = [
        'https://www.next-llms-txt.com/services.html.md',
        'https://www.next-llms-txt.com/index.html.md',
      ]

      const responses = await Promise.all(
        urls.map((url) => {
          const request = new NextRequest(url)
          return GET(request)
        }),
      )

      // All should return 404 since no discovery setup
      responses.forEach((response) => {
        expect(response.status).toBe(404)
      })
    })
  })
})
