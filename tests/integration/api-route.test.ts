import type { LLMsTxtConfig } from '../../src/types'
import { NextRequest } from 'next/server'
import { createLLMsTxtHandlers } from '../../src/handler'

describe('integration: LLMs.txt API Route', () => {
  const testConfig: LLMsTxtConfig = {
    title: 'Integration Test Project',
    description: 'Testing the complete flow',
    sections: [
      {
        title: 'API Documentation',
        items: [
          {
            title: 'REST API',
            url: '/api/docs',
            description: 'Complete REST API documentation',
          },
          {
            title: 'GraphQL API',
            url: '/api/graphql',
            description: 'GraphQL schema and queries',
          },
        ],
      },
      {
        title: 'Guides',
        items: [
          {
            title: 'Quick Start',
            url: '/guides/quick-start',
          },
          {
            title: 'Best Practices',
            url: '/guides/best-practices',
          },
        ],
      },
    ],
  }

  it('should generate complete llms.txt file through API route', async () => {
    const { GET } = createLLMsTxtHandlers(testConfig)

    // Simulate a real Next.js request
    const request = new NextRequest('http://localhost:3000/llms.txt', {
      method: 'GET',
    })

    const response = await GET(request)

    // Verify response properties
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')

    // Verify content structure
    const content = await response.text()

    // Check main structure
    expect(content).toMatch(/^# Integration Test Project\n/)
    expect(content).toContain('> Testing the complete flow')

    // Check sections
    expect(content).toContain('## API Documentation')
    expect(content).toContain('## Guides')

    // Check items with descriptions
    expect(content).toContain('- [REST API](/api/docs): Complete REST API documentation')
    expect(content).toContain('- [GraphQL API](/api/graphql): GraphQL schema and queries')

    // Check items without descriptions
    expect(content).toContain('- [Quick Start](/guides/quick-start)')
    expect(content).toContain('- [Best Practices](/guides/best-practices)')

    // Verify proper markdown formatting
    const lines = content.split('\n')
    expect(lines[0]).toBe('# Integration Test Project')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('> Testing the complete flow')
    expect(lines[3]).toBe('')
  })

  it('should handle empty request correctly', async () => {
    const { GET } = createLLMsTxtHandlers({ title: 'Empty Test' })

    const request = new NextRequest('http://localhost:3000/llms.txt')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const content = await response.text()
    expect(content).toBe('# Empty Test\n')
  })

  it('should work with Auth.js-style configuration', async () => {
    const handlerConfig = {
      defaultConfig: testConfig,
      customProperty: 'test',
    }

    const { GET } = createLLMsTxtHandlers(handlerConfig)

    const request = new NextRequest('http://localhost:3000/llms.txt')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const content = await response.text()
    expect(content).toContain('# Integration Test Project')
  })

  it('should produce valid llms.txt format according to spec', async () => {
    const { GET } = createLLMsTxtHandlers(testConfig)

    const request = new NextRequest('http://localhost:3000/llms.txt')
    const response = await GET(request)
    const content = await response.text()

    // Verify llmstxt.org specification compliance
    const lines = content.split('\n').filter(line => line.length > 0)

    // First line should be H1 title
    expect(lines[0]).toMatch(/^# .+/)

    // Second line should be blockquote description (if present)
    if (testConfig.description) {
      expect(lines[1]).toMatch(/^> .+/)
    }

    // Find all H2 headers (sections)
    const h2Lines = lines.filter(line => line.match(/^## .+/))
    expect(h2Lines).toHaveLength(2)
    expect(h2Lines[0]).toBe('## API Documentation')
    expect(h2Lines[1]).toBe('## Guides')

    // Find all markdown list items
    const listItems = lines.filter(line => line.match(/^- \[.+\]\(.+\)/))
    expect(listItems).toHaveLength(4)

    // Verify list item format: - [Title](url) or - [Title](url): Description
    listItems.forEach((item) => {
      expect(item).toMatch(/^- \[.+\]\(.+\)(?:: .+)?$/)
    })
  })

  it('should generate llms.txt with optional section through API route', async () => {
    const configWithOptional: LLMsTxtConfig = {
      title: 'Test Project with Optional',
      description: 'Testing optional section',
      sections: [
        {
          title: 'Core Documentation',
          items: [
            {
              title: 'Getting Started',
              url: '/docs/getting-started',
            },
          ],
        },
      ],
      optional: [
        {
          title: 'Advanced Topics',
          url: '/docs/advanced',
          description: 'For experienced users',
        },
        {
          title: 'Legacy Documentation',
          url: '/docs/legacy',
        },
      ],
    }

    const { GET } = createLLMsTxtHandlers(configWithOptional)

    const request = new NextRequest('http://localhost:3000/llms.txt', {
      method: 'GET',
    })

    const response = await GET(request)
    const content = await response.text()

    // Verify response
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')

    // Verify content structure
    const lines = content.split('\n').filter(line => line.trim() !== '')

    // Should contain Optional section
    const optionalSectionIndex = lines.findIndex(line => line === '## Optional')
    expect(optionalSectionIndex).toBeGreaterThan(-1)

    // Verify optional items are present
    const optionalItems = lines.slice(optionalSectionIndex + 1).filter(line => line.startsWith('- ['))
    expect(optionalItems).toHaveLength(2)
    expect(optionalItems[0]).toBe('- [Advanced Topics](/docs/advanced): For experienced users')
    expect(optionalItems[1]).toBe('- [Legacy Documentation](/docs/legacy)')
  })
})
