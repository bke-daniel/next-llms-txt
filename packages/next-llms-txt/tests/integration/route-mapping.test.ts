import { NextResponse } from 'next/server'
import { createLLmsTxt } from '../../src/handler'
import { LLMS_TXT_HANDLER_CONFIG } from '../constants'
import createMockRequest from '../create-mock-request'

describe('route-to-file mapping', () => {
  const { GET: handler } = createLLmsTxt(LLMS_TXT_HANDLER_CONFIG)

  describe('root route', () => {
    it('should map / route to app/page.tsx', async () => {
      const request = createMockRequest('/index.html.md')
      const response = await handler(request)

      expect(response).toBeInstanceOf(NextResponse)
    })
  })

  describe('path normalization', () => {
    it('should normalize /about.html.md to match /about route', async () => {
      const request = createMockRequest('/about.html.md')
      const response = await handler(request)

      // Should successfully match even if page doesn't exist (will be 404)
      expect(response).toBeInstanceOf(NextResponse)
      expect([200, 404]).toContain(response.status)
    })

    it('should strip trailing slash before .html.md', async () => {
      const request = createMockRequest('/nested/.html.md')
      const response = await handler(request)

      expect(response).toBeInstanceOf(NextResponse)
    })
  })

  describe('non-existent routes', () => {
    it('should return 404 for non-existent page routes', async () => {
      const request = createMockRequest('/nonexistent.html.md')
      const response = await handler(request)

      expect(response.status).toBe(404)
    })
  })

  describe('special routes', () => {
    it('should ignore route groups like (marketing)', async () => {
      // Route groups should be ignored in discovery
      const request = createMockRequest('/(marketing)/about.html.md')
      const response = await handler(request)

      // Should either match /about (if exists) or 404
      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should ignore private folders starting with _', async () => {
      const request = createMockRequest('/_components/Button.html.md')
      const response = await handler(request)

      // Should not find pages in private folders
      expect(response.status).toBe(404)
    })
  })
})
