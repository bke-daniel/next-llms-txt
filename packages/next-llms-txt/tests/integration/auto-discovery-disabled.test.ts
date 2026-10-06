import { NextRequest } from 'next/server'
import { createLLmsTxt } from '../../src/handler'
import { AUTO_DISCOVERY, BASE_URL } from '../constants'

describe('createLLmsTxt with autoDiscovery: false', () => {
  it('does not invoke discovery and only emits the user-supplied manual config', async () => {
    const handler = createLLmsTxt({
      baseUrl: BASE_URL,
      autoDiscovery: false,
      defaultConfig: {
        title: 'Manual Only',
        description: 'No discovery here',
        sections: [
          {
            title: 'Hand-curated',
            items: [
              { title: 'Page A', url: `${BASE_URL}/a`, description: 'Manual A' },
            ],
          },
        ],
      },
    })

    const req = new NextRequest(`${BASE_URL}/llms.txt`)
    const res = await handler.GET(req)
    const text = await res.text()

    expect(res.status).toBe(200)
    expect(text).toContain('# Manual Only')
    expect(text).toContain('> No discovery here')
    expect(text).toContain('## Hand-curated')
    expect(text).toContain('- [Page A]')
    // The fixture's discovered pages (e.g. /all-exports, /full-test) must NOT
    // leak in when discovery is explicitly disabled.
    expect(text).not.toContain('/all-exports')
    expect(text).not.toContain('## Pages')
  })

  it('still discovers when autoDiscovery is an object even if defaultConfig is otherwise empty', async () => {
    const handler = createLLmsTxt({
      baseUrl: BASE_URL,
      autoDiscovery: AUTO_DISCOVERY,
      defaultConfig: { title: 'Discovery On' },
    })

    const req = new NextRequest(`${BASE_URL}/llms.txt`)
    const res = await handler.GET(req)
    const text = await res.text()

    expect(res.status).toBe(200)
    expect(text).toContain('# Discovery On')
    // No user-supplied pages: discovered entries live in section headings,
    // not under the legacy `## Pages` block.
    expect(text).not.toContain('## Pages')
    expect(text).toContain('## Main Pages')
  })
})
