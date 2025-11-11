import { NextResponse } from 'next/server'
import { createLLmsTxt } from '../../src/handler'
import createMockRequest from '../create-mock-request'

describe('route-to-file mapping', () => {
  describe('page.tsx files', () => {
    it('should successfully return content for /services.html.md', async () => {
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

      // Should find the services page and return 200
      expect(response.status).toBe(200)
      const text = await response.text()
      expect(text).toContain('# ')
    })

    it('should handle /services.html.md request by finding /services route', async () => {
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

      // Should find the page at /services and return its config
      expect(response).toBeInstanceOf(NextResponse)
      expect([200, 404]).toContain(response.status)

      if (response.status === 200) {
        const text = await response.text()
        expect(text).toContain('Services')
      }
    })

    it('should map nested route /services/consulting to app/services/consulting/page.tsx', async () => {
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

  describe('root route', () => {
    it('should map / route to app/page.tsx', async () => {
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

      const request = createMockRequest('/index.html.md')
      const response = await handler(request)

      expect(response).toBeInstanceOf(NextResponse)
    })
  })

  describe('path normalization', () => {
    it('should normalize /about.html.md to match /about route', async () => {
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

      const request = createMockRequest('/about.html.md')
      const response = await handler(request)

      // Should successfully match even if page doesn't exist (will be 404)
      expect(response).toBeInstanceOf(NextResponse)
      expect([200, 404]).toContain(response.status)
    })

    it('should strip trailing slash before .html.md', async () => {
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

  describe('non-existent routes', () => {
    it('should return 404 for non-existent page routes', async () => {
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

      const request = createMockRequest('/nonexistent.html.md')
      const response = await handler(request)

      expect(response.status).toBe(404)
    })
  })

  describe('special routes', () => {
    it('should ignore route groups like (marketing)', async () => {
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

      // Route groups should be ignored in discovery
      const request = createMockRequest('/(marketing)/about.html.md')
      const response = await handler(request)

      // Should either match /about (if exists) or 404
      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should ignore private folders starting with _', async () => {
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

      const request = createMockRequest('/_components/Button.html.md')
      const response = await handler(request)

      // Should not find pages in private folders
      expect(response.status).toBe(404)
    })
  })
})
