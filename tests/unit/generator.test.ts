import type { LLMsTxtConfig } from '../../src/types'
import { generateLLMsTxt } from '../../src/generator'

describe('generateLLMsTxt', () => {
  it('should generate basic llms.txt with title only', () => {
    const config: LLMsTxtConfig = {
      title: 'Test Project',
    }

    const result = generateLLMsTxt(config)

    expect(result).toBe('# Test Project\n')
  })

  it('should generate llms.txt with title and description', () => {
    const config: LLMsTxtConfig = {
      title: 'Test Project',
      description: 'A test project for demonstration',
    }

    const result = generateLLMsTxt(config)

    expect(result).toBe('# Test Project\n\n> A test project for demonstration\n')
  })

  it('should generate llms.txt with sections and items', () => {
    const config: LLMsTxtConfig = {
      title: 'Test Project',
      description: 'A test project',
      sections: [
        {
          title: 'Documentation',
          items: [
            {
              title: 'Getting Started',
              url: '/docs/getting-started',
              description: 'Learn the basics',
            },
            {
              title: 'API Reference',
              url: '/docs/api',
            },
          ],
        },
      ],
    }

    const result = generateLLMsTxt(config)
    const expected = `# Test Project

> A test project

## Documentation
- [Getting Started](/docs/getting-started): Learn the basics
- [API Reference](/docs/api)
`

    expect(result).toBe(expected)
  })

  it('should generate llms.txt with multiple sections', () => {
    const config: LLMsTxtConfig = {
      title: 'Multi-Section Project',
      sections: [
        {
          title: 'Documentation',
          items: [
            {
              title: 'Guide',
              url: '/guide',
            },
          ],
        },
        {
          title: 'Examples',
          items: [
            {
              title: 'Basic Example',
              url: '/examples/basic',
              description: 'Simple usage example',
            },
          ],
        },
      ],
    }

    const result = generateLLMsTxt(config)
    const expected = `# Multi-Section Project

## Documentation
- [Guide](/guide)

## Examples
- [Basic Example](/examples/basic): Simple usage example
`

    expect(result).toBe(expected)
  })

  it('should handle empty sections array', () => {
    const config: LLMsTxtConfig = {
      title: 'Empty Sections Project',
      sections: [],
    }

    const result = generateLLMsTxt(config)

    expect(result).toBe('# Empty Sections Project\n')
  })

  it('should handle section with no items', () => {
    const config: LLMsTxtConfig = {
      title: 'Test Project',
      sections: [
        {
          title: 'Empty Section',
          items: [],
        },
      ],
    }

    const result = generateLLMsTxt(config)
    const expected = `# Test Project

## Empty Section
`

    expect(result).toBe(expected)
  })

  it('should generate llms.txt with optional section', () => {
    const config: LLMsTxtConfig = {
      title: 'Test Project',
      description: 'A test project',
      sections: [
        {
          title: 'Documentation',
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
          title: 'Advanced Guide',
          url: '/docs/advanced',
          description: 'For power users only',
        },
        {
          title: 'Legacy Docs',
          url: '/docs/legacy',
        },
      ],
    }

    const result = generateLLMsTxt(config)
    const expected = `# Test Project

> A test project

## Documentation
- [Getting Started](/docs/getting-started)

## Optional
- [Advanced Guide](/docs/advanced): For power users only
- [Legacy Docs](/docs/legacy)
`

    expect(result).toBe(expected)
  })

  it('should generate optional section only', () => {
    const config: LLMsTxtConfig = {
      title: 'Test Project',
      optional: [
        {
          title: 'Secondary Info',
          url: '/secondary',
          description: 'Can be skipped',
        },
      ],
    }

    const result = generateLLMsTxt(config)
    const expected = `# Test Project

## Optional
- [Secondary Info](/secondary): Can be skipped
`

    expect(result).toBe(expected)
  })

  it('should handle empty optional array', () => {
    const config: LLMsTxtConfig = {
      title: 'Test Project',
      optional: [],
    }

    const result = generateLLMsTxt(config)

    expect(result).toBe('# Test Project\n')
  })
})
