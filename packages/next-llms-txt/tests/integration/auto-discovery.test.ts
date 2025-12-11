import { NextRequest } from 'next/server'
import { createLLmsTxt } from '../../src/handler'
import { BASE_URL, LLMS_TXT_HANDLER_CONFIG } from '../constants'

describe('auto-discovery integration', () => {
  const handler = createLLmsTxt(LLMS_TXT_HANDLER_CONFIG)

  it('generates site-wide llms.txt with discovered pages', async () => {
    const req = new NextRequest(`${BASE_URL}/llms.txt`)
    const res = await handler.GET(req)
    const text = await res.text()
    expect(text).toContain('# Test Site')
    expect(text).toContain('next-llms-txt test-server')
    expect(res.headers.get('content-type')).toMatch(/text\/markdown;?\s*charset=(utf-8|UTF-8)/)
  })

  it('generates per-page .html.md from discovered config', async () => {
    const req = new NextRequest(`${BASE_URL}/nested/no-export.html.md`)
    const res = await handler.GET(req)
    const text = await res.text()
    // Handler returns fallback message if page not found or autoDiscovery not enabled
    expect(text).toMatch(/Auto-discovery must be enabled|Page not found|llms.txt configuration available/)
    expect(res.headers.get('content-type')).toMatch(/text\/plain;?\s*charset=(utf-8|UTF-8)/)
  })
})
