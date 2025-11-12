import type { LLMsTxtConfig } from '../../src/types'
import { generateLLMsTxt } from '../../src/generator'

const mockLlmsTxtConfig: LLMsTxtConfig = {
  title: 'Test LLMs.txt',
  description: 'This is a test llms.txt file',
  sections: [
    {
      title: 'Main Section',
      description: 'This is the main section',
      items: [
        {
          title: 'Item One',
          url: '/item-one',
          description: 'Description for item one',
        },
        {
          title: 'Item Two',
          url: '/item-two',
        },
      ],
    },
  ],
  optional: [
    {
      title: 'Optional Item',
      url: '/optional-item',
      description: 'This is an optional item',
    },
  ],
}

describe('generateLLMsTxt', () => {
  describe('config cases', () => {
    it('handles empty config', () => {
      // TODO I'd say this shouldn't do nothing?!
      const result = generateLLMsTxt({ title: '' })
      expect(result).toContain('# ')
    })

    it('handles invalid input types gracefully', () => {
      // @ts-expect-error Testing null input for error handling
      expect(() => generateLLMsTxt(null)).toThrow()
      // @ts-expect-error Testing undefined input for error handling
      expect(() => generateLLMsTxt(undefined)).toThrow()
    })

    it('handles missing sections and optional', () => {
      const config: LLMsTxtConfig = { title: 'Demo' }
      const result = generateLLMsTxt(config)
      expect(result).toContain('# Demo')
      expect(result).not.toContain('## Section')
      expect(result).not.toContain('## Optional')
    })

    it('handles undefined sections and optional', () => {
      const config: LLMsTxtConfig = { title: 'Demo', sections: undefined, optional: undefined }
      const result = generateLLMsTxt(config)
      expect(result).toContain('# Demo')
      expect(result).not.toContain('## Section')
      expect(result).not.toContain('## Optional')
    })

    it('handles null sections and optional', () => {
      // @ts-expect-error Testing null input for error handling
      const config: LLMsTxtConfig = { title: 'Demo', sections: null, optional: null }
      const result = generateLLMsTxt(config)
      expect(result).toContain('# Demo')
      expect(result).not.toContain('## Section')
      expect(result).not.toContain('## Optional')
    })
  })

  describe('main', () => {
    it('should generate all parts', () => {
      const result = generateLLMsTxt(mockLlmsTxtConfig)
      expect(result).toContain('# Test LLMs.txt')
      expect(result).toContain('> This is a test llms.txt file')
      expect(result).toContain('## Main Section')
      expect(result).toContain('- [Item One](/item-one): Description for item one')
      expect(result).toContain('- [Item Two](/item-two)')
      expect(result).toContain('## Optional')
      expect(result).toContain('- [Optional Item](/optional-item): This is an optional item')
    })
    it('should generate markdown with title and description', () => {
      const config: LLMsTxtConfig = {
        title: 'Demo Title',
        description: 'Demo Description',
        sections: [],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('# Demo Title')
      expect(result).toContain('> Demo Description')
      expect(result).not.toContain('## Section')
      expect(result).not.toContain('## Optional')
    })
  })

  describe('whitespace handling', () => {
    it('should trim whitespaces for title and description', () => {
      const config: LLMsTxtConfig = {
        title: '       Demo',
        description: `
        Demo description
      `,
        sections: [],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('# Demo')
      expect(result).toContain('> Demo description')
      expect(result).not.toContain('## Section')
      expect(result).not.toContain('## Optional')
    })
  })

  describe('pages', () => { })

  describe('section', () => {
    it('includes sections and items', () => {
      const config: LLMsTxtConfig = {
        title: 'Demo',
        sections: [
          {
            title: 'Section 1',
            items: [
              { title: 'Item 1', url: '/item1', description: 'Desc 1' },
              { title: 'Item 2', url: '/item2' },
            ],
          },
        ],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('## Section 1')
      expect(result).toContain('- [Item 1](/item1): Desc 1')
      expect(result).toContain('- [Item 2](/item2)')
    })
  })

  describe('optional', () => {
    it('includes optional section', () => {
      const config: LLMsTxtConfig = {
        title: 'Demo',
        optional: [
          { title: 'Opt', url: '/opt', description: 'Optional desc' },
        ],
        sections: [],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('## Optional')
      expect(result).toContain('- [Opt](/opt): Optional desc')
    })
  })

  it('includes discovered pages', () => {
    const config: LLMsTxtConfig = { title: 'Demo', sections: [] }
    const pages = [
      {
        route: '/foo',
        filePath: '/src/pages/foo.tsx',
        hasLLMsTxtExport: true,
        hasMetadataFallback: false,
        warnings: [],
        config: { title: 'Foo', description: 'Bar' },
      },
      {
        route: '/bar',
        filePath: '/src/pages/bar.tsx',
        hasLLMsTxtExport: true,
        hasMetadataFallback: false,
        warnings: [],
        config: { title: 'Bar' },
      },
    ]
    const result = generateLLMsTxt(config, pages)
    expect(result).toContain('## Pages')
    expect(result).toContain('- [Foo](/foo): Bar')
    expect(result).toContain('- [Bar](/bar)')
  })
})
