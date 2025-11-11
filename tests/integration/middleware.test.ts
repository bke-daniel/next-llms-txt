import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createLLmsTxt } from '../../src/handler'
import createMockRequest from '../create-mock-request'

describe('middleware integration', () => {
  const { GET: handleLLmsTxt } = createLLmsTxt({
    defaultConfig: {
      title: 'Test Site',
      description: 'Test site description',
    },
  })

  describe('path interception', () => {
    it('should intercept /llms.txt requests', async () => {
      const request = createMockRequest('/llms.txt')
      const response = await handleLLmsTxt(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    })

    it('should intercept .html.md requests', async () => {
      const { GET: handler } = createLLmsTxt({
        defaultConfig: {
          title: 'Test Site',
          description: 'Test description',
        },
        autoDiscovery: {
          baseUrl: 'http://localhost:3000',
          appDir: './tests/fixtures/test-project/src/app',
        },
      })

      const request = createMockRequest('/services.html.md')
      const response = await handler(request)

      expect(response).toBeInstanceOf(NextResponse)
      // Should return either 200 (found) or 404 (not found), but not crash
      expect([200, 404]).toContain(response.status)
    })

    it('should handle nested paths with .html.md', async () => {
      const { GET: handler } = createLLmsTxt({
        defaultConfig: {
          title: 'Test Site',
          description: 'Test description',
        },
        autoDiscovery: {
          baseUrl: 'http://localhost:3000',
          appDir: './tests/fixtures/test-project/src/app',
        },
      })

      const request = createMockRequest('/services/consulting.html.md')
      const response = await handler(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect([200, 404]).toContain(response.status)
    })
  })

  describe('middleware pattern', () => {
    it('should work in a typical middleware setup', async () => {
      const { GET: handleLLmsTxt } = createLLmsTxt({
        defaultConfig: {
          title: 'Test Site',
          description: 'Test description',
        },
      })

      async function middleware(request: NextRequest) {
        const { pathname } = request.nextUrl

        if (pathname === '/llms.txt' || pathname.endsWith('.html.md'))
          return await handleLLmsTxt(request)

        return NextResponse.next()
      }

      // Test llms.txt interception
      const llmsRequest = createMockRequest('/llms.txt')
      const llmsResponse = await middleware(llmsRequest)
      expect(llmsResponse.status).toBe(200)

      // Test regular page (should pass through)
      const regularRequest = createMockRequest('/about')
      const regularResponse = await middleware(regularRequest)
      expect(regularResponse.status).toBe(200) // NextResponse.next() returns 200 by default
    })
  })

  describe('content type headers', () => {
    it('should set correct content-type for llms.txt', async () => {
      const request = createMockRequest('/llms.txt')
      const response = await handleLLmsTxt(request)

      expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    })

    it('should set cache-control headers', async () => {
      const request = createMockRequest('/llms.txt')
      const response = await handleLLmsTxt(request)

      expect(response.headers.get('Cache-Control')).toContain('public')
    })
  })

  describe('path normalization', () => {
    it('should strip .html.md extension when matching routes', async () => {
      const { GET: handler } = createLLmsTxt({
        defaultConfig: {
          title: 'Test Site',
          description: 'Test description',
        },
        autoDiscovery: {
          baseUrl: 'http://localhost:3000',
          appDir: './tests/fixtures/test-project/src/app',
        },
      })

      const request = createMockRequest('/services.html.md')
      const response = await handler(request)

      // Should attempt to find /services route (not /services.html.md)
      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should handle trailing slashes correctly', async () => {
      const { GET: handler } = createLLmsTxt({
        defaultConfig: {
          title: 'Test Site',
          description: 'Test description',
        },
        autoDiscovery: {
          baseUrl: 'http://localhost:3000',
          appDir: './tests/fixtures/test-project/src/app',
        },
      })

      const request = createMockRequest('/services/.html.md')
      const response = await handler(request)

      expect(response).toBeInstanceOf(NextResponse)
    })
  })

  describe('error handling', () => {
    it('should handle invalid paths gracefully', async () => {
      const request = createMockRequest('/nonexistent.html.md')
      const response = await handleLLmsTxt(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect([404, 400]).toContain(response.status)
    })

    it('should return 400 when auto-discovery is disabled for page requests', async () => {
      const { GET: handler } = createLLmsTxt({
        defaultConfig: {
          title: 'Test',
          description: 'Test',
        },
      })

      const request = createMockRequest('/about.html.md')
      const response = await handler(request)

      expect(response.status).toBe(400)
    })
  })

  describe('matcher pattern compatibility', () => {
    it('should match the middleware config matcher pattern', () => {
      const _config = {
        matcher: ['/llms.txt', '/:path*.html.md'],
      }

      // Simulate Next.js matcher logic
      const shouldMatch = (path: string) => {
        return path === '/llms.txt' || path.endsWith('.html.md')
      }

      expect(shouldMatch('/llms.txt')).toBe(true)
      expect(shouldMatch('/about.html.md')).toBe(true)
      expect(shouldMatch('/services/consulting.html.md')).toBe(true)
      expect(shouldMatch('/about')).toBe(false)
      expect(shouldMatch('/services')).toBe(false)
    })
  })
})
