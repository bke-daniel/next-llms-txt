import type { LLMsTxtConfig } from '../../src/types'
import { generateLLMsTxt } from '../../src/generator'
import { FULL_LLMS_TXT_CONFIG } from '../constants'

describe('generateLLMsTxt', () => {
  describe('config cases', () => {
    it('handles empty config', () => {
      // TODO I'd say this should do nothing?!
      const result = generateLLMsTxt({ title: '' })
      expect(result).toContain('# ')
    })

    describe('missing / wrong configs', () => {
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
        const config: LLMsTxtConfig = {
          title: FULL_LLMS_TXT_CONFIG.title,
          sections: undefined,
          optional: undefined,
        }
        const result = generateLLMsTxt(config)
        expect(result).toContain(`# ${FULL_LLMS_TXT_CONFIG.title}`)
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

      it('should handle empty arrays', () => {
        const config: LLMsTxtConfig = { title: 'Demo', sections: [], optional: [] }
        const result = generateLLMsTxt(config)
        expect(result).toContain('# Demo')
        expect(result).not.toContain('## Section')
        expect(result).not.toContain('## Optional')
      })
    })
  })

  describe('main', () => {
    it('should generate all parts', () => {
      const result = generateLLMsTxt(FULL_LLMS_TXT_CONFIG)
      expect(result).toContain(`# ${FULL_LLMS_TXT_CONFIG.title}`)
      expect(result).toContain(`> ${FULL_LLMS_TXT_CONFIG.description}`)
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

  describe('pages', () => {
    it('includes discovered pages with config', () => {
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

    it('handles pages without description', () => {
      const config: LLMsTxtConfig = { title: 'Demo', sections: [] }
      const pages = [
        {
          route: '/test',
          filePath: '/src/pages/test.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          warnings: [],
          config: { title: 'Test Page' },
        },
      ]
      const result = generateLLMsTxt(config, pages)
      expect(result).toContain('## Pages')
      expect(result).toContain('- [Test Page](/test)')
      expect(result).not.toContain('- [Test Page](/test):')
    })

    it('handles multiple pages', () => {
      const config: LLMsTxtConfig = { title: 'Demo', sections: [] }
      const pages = [
        {
          route: '/page1',
          filePath: '/src/pages/page1.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          warnings: [],
          config: { title: 'Page 1', description: 'First page' },
        },
        {
          route: '/page2',
          filePath: '/src/pages/page2.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          warnings: [],
          config: { title: 'Page 2', description: 'Second page' },
        },
        {
          route: '/page3',
          filePath: '/src/pages/page3.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          warnings: [],
          config: { title: 'Page 3' },
        },
      ]
      const result = generateLLMsTxt(config, pages)
      expect(result).toContain('## Pages')
      expect(result).toContain('- [Page 1](/page1): First page')
      expect(result).toContain('- [Page 2](/page2): Second page')
      expect(result).toContain('- [Page 3](/page3)')
    })
  })

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

    it('includes section with description', () => {
      const config: LLMsTxtConfig = {
        title: 'Demo',
        sections: [
          {
            title: 'Documentation',
            description: 'Technical documentation and guides',
            items: [
              { title: 'Getting Started', url: '/docs/start', description: 'Start here' },
            ],
          },
        ],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('## Documentation')
      expect(result).toContain('> Technical documentation and guides')
      expect(result).toContain('- [Getting Started](/docs/start): Start here')
    })

    it('includes multiple sections', () => {
      const config: LLMsTxtConfig = {
        title: 'Demo',
        sections: [
          {
            title: 'Section 1',
            items: [
              { title: 'Item 1', url: '/item1' },
            ],
          },
          {
            title: 'Section 2',
            description: 'Second section desc',
            items: [
              { title: 'Item 2', url: '/item2', description: 'Desc 2' },
            ],
          },
          {
            title: 'Section 3',
            items: [],
          },
        ],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('## Section 1')
      expect(result).toContain('- [Item 1](/item1)')
      expect(result).toContain('## Section 2')
      expect(result).toContain('> Second section desc')
      expect(result).toContain('- [Item 2](/item2): Desc 2')
      expect(result).toContain('## Section 3')
    })

    it('handles section with no items', () => {
      const config: LLMsTxtConfig = {
        title: 'Demo',
        sections: [
          {
            title: 'Empty Section',
            items: [],
          },
        ],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('## Empty Section')
      expect(result).not.toContain('- [')
    })

    it('handles section description without items', () => {
      const config: LLMsTxtConfig = {
        title: 'Demo',
        sections: [
          {
            title: 'Info Section',
            description: 'Just information, no links',
            items: [],
          },
        ],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('## Info Section')
      expect(result).toContain('> Just information, no links')
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

    it('includes multiple optional items', () => {
      const config: LLMsTxtConfig = {
        title: 'Demo',
        optional: [
          { title: 'Opt 1', url: '/opt1', description: 'First optional' },
          { title: 'Opt 2', url: '/opt2' },
          { title: 'Opt 3', url: '/opt3', description: 'Third optional' },
        ],
        sections: [],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('## Optional')
      expect(result).toContain('- [Opt 1](/opt1): First optional')
      expect(result).toContain('- [Opt 2](/opt2)')
      expect(result).not.toContain('- [Opt 2](/opt2):')
      expect(result).toContain('- [Opt 3](/opt3): Third optional')
    })

    it('includes optional without description', () => {
      const config: LLMsTxtConfig = {
        title: 'Demo',
        optional: [
          { title: 'Simple', url: '/simple' },
        ],
        sections: [],
      }
      const result = generateLLMsTxt(config)
      expect(result).toContain('## Optional')
      expect(result).toContain('- [Simple](/simple)')
      expect(result).not.toContain('- [Simple](/simple):')
    })
  })

  describe('combined scenarios', () => {
    it('generates complete llms.txt with all features', () => {
      const config: LLMsTxtConfig = {
        title: 'Complete Site',
        description: 'A complete example',
        sections: [
          {
            title: 'Main',
            description: 'Main content',
            items: [
              { title: 'Home', url: '/', description: 'Homepage' },
            ],
          },
          {
            title: 'Docs',
            items: [
              { title: 'Guide', url: '/guide' },
            ],
          },
        ],
        optional: [
          { title: 'Blog', url: '/blog', description: 'Our blog' },
        ],
      }
      const pages = [
        {
          route: '/about',
          filePath: '/src/pages/about.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          warnings: [],
          config: { title: 'About', description: 'About us' },
        },
      ]
      const result = generateLLMsTxt(config, pages)

      expect(result).toContain('# Complete Site')
      expect(result).toContain('> A complete example')
      expect(result).toContain('## Pages')
      expect(result).toContain('- [About](/about): About us')
      expect(result).toContain('## Main')
      expect(result).toContain('> Main content')
      expect(result).toContain('- [Home](/): Homepage')
      expect(result).toContain('## Docs')
      expect(result).toContain('- [Guide](/guide)')
      expect(result).toContain('## Optional')
      expect(result).toContain('- [Blog](/blog): Our blog')
    })

    it('handles pages and sections together', () => {
      const config: LLMsTxtConfig = {
        title: 'Mixed Content',
        sections: [
          {
            title: 'Manual',
            items: [
              { title: 'Item', url: '/item' },
            ],
          },
        ],
      }
      const pages = [
        {
          route: '/auto',
          filePath: '/src/pages/auto.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          warnings: [],
          config: { title: 'Auto' },
        },
      ]
      const result = generateLLMsTxt(config, pages)

      expect(result).toContain('## Pages')
      expect(result).toContain('- [Auto](/auto)')
      expect(result).toContain('## Manual')
      expect(result).toContain('- [Item](/item)')
    })

    it('preserves section order', () => {
      const config: LLMsTxtConfig = {
        title: 'Ordered',
        sections: [
          { title: 'First', items: [{ title: 'A', url: '/a' }] },
          { title: 'Second', items: [{ title: 'B', url: '/b' }] },
          { title: 'Third', items: [{ title: 'C', url: '/c' }] },
        ],
      }
      const result = generateLLMsTxt(config)

      const firstPos = result.indexOf('## First')
      const secondPos = result.indexOf('## Second')
      const thirdPos = result.indexOf('## Third')

      expect(firstPos).toBeLessThan(secondPos)
      expect(secondPos).toBeLessThan(thirdPos)
    })
  })

  describe('markdown formatting', () => {
    it('uses correct markdown syntax', () => {
      const config: LLMsTxtConfig = {
        title: 'Format Test',
        description: 'Test description',
        sections: [
          {
            title: 'Section',
            items: [
              { title: 'Link', url: '/link', description: 'Desc' },
            ],
          },
        ],
      }
      const result = generateLLMsTxt(config)

      expect(result).toMatch(/^# Format Test/)
      expect(result).toContain('> Test description')
      expect(result).toContain('## Section')
      expect(result).toContain('- [Link](/link): Desc')
    })

    it('separates blocks with double newlines', () => {
      const config: LLMsTxtConfig = {
        title: 'Spacing',
        description: 'Test',
        sections: [
          { title: 'First', items: [{ title: 'A', url: '/a' }] },
          { title: 'Second', items: [{ title: 'B', url: '/b' }] },
        ],
      }
      const result = generateLLMsTxt(config)

      expect(result).toContain('\n\n')
      const blocks = result.split('\n\n')
      expect(blocks.length).toBeGreaterThan(1)
    })
  })
})
