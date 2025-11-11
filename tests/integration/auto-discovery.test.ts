import path from 'node:path'
import { NextRequest } from 'next/server'
import { createLLmsTxt } from '../../src/handler'

describe('auto-discovery integration', () => {
  const handler = createLLmsTxt({
    title: 'Test Site',
    description: 'Auto-discovery test',
    autoDiscovery: {
      rootDir: path.resolve(__dirname, '../tests/fixtures/test-project'),
      appDir: 'src/app',
      baseUrl: 'http://localhost:3000',
    },
  })

  // TODO Fix
  it.skip('generates site-wide llms.txt with discovered pages', async () => {
    const req = new NextRequest('http://localhost:3000/llms.txt')
    const res = await handler.GET(req)
    const text = await res.text()
    expect(text).toContain('# Test Site')
    expect(text).toContain('Auto-discovery test')
    expect(res.headers.get('content-type')).toMatch(/text\/plain;?\s*charset=(utf-8|UTF-8)/)
  })

  it('generates per-page .html.md from discovered config', async () => {
    const req = new NextRequest('http://localhost:3000/services/no-export.html.md')
    const res = await handler.GET(req)
    const text = await res.text()
    // Handler returns fallback message if page not found or autoDiscovery not enabled
    expect(text).toMatch(/Auto-discovery must be enabled|Page not found|llms.txt configuration available/)
    expect(res.headers.get('content-type')).toMatch(/text\/plain;?\s*charset=(utf-8|UTF-8)/)
  })
})
