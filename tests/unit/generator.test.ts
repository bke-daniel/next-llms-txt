import type { LLMsTxtConfig } from '../../src/types'
import { generateLLMsTxt } from '../../src/generator'

describe('generateLLMsTxt', () => {
  it('handles empty config', () => {
    const result = generateLLMsTxt({ title: '' })
    expect(result).toContain('# ')
  })

  it('handles missing sections and optional', () => {
    const config = { title: 'Demo' }
    const result = generateLLMsTxt(config)
    expect(result).toContain('# Demo')
    expect(result).not.toContain('## Section')
    expect(result).not.toContain('## Optional')
  })

  it('handles invalid input types gracefully', () => {
    // @ts-expect-error Testing null input for error handling
    expect(() => generateLLMsTxt(null)).toThrow()
    // @ts-expect-error Testing undefined input for error handling
    expect(() => generateLLMsTxt(undefined)).toThrow()
  })

  it('generates markdown with title and description', () => {
    const config: LLMsTxtConfig = {
      title: 'Demo Title',
      description: 'Demo Description',
      sections: [],
    }
    const result = generateLLMsTxt(config)
    expect(result).toContain('# Demo Title')
    expect(result).toContain('> Demo Description')
  })

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
