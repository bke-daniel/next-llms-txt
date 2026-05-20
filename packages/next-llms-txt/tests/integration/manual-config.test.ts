import { NextRequest } from 'next/server'
import { createLLmsTxt } from '../../src/handler'
import { AUTO_DISCOVERY, BASE_URL } from '../constants'

describe('manual config integration', () => {
  const handler = createLLmsTxt({
    baseUrl: BASE_URL,
    autoDiscovery: AUTO_DISCOVERY,
    defaultConfig: {
      title: 'Manual Site',
      description: 'Manual config test',
      sections: [
        {
          title: 'Docs',
          items: [
            { title: 'Intro', url: `${BASE_URL}/docs/intro`, description: 'Getting started' },
          ],
        },
      ],
    },
  })

  it('returns 404 for .html.md when not discovered', async () => {
    const req = new NextRequest(`${BASE_URL}/unknown.html.md`)
    const res = await handler.GET(req)
    expect(res.status).toBe(404)
  })
})
