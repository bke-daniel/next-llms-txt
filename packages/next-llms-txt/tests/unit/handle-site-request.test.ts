import type { LLMsTxtHandlerConfig } from '../../src/types'
import { NextRequest } from 'next/server'
import { vi } from 'vitest'
import handleSiteRequest from '../../src/handle-site-request'
import { AUTO_DISCOVERY, BASE_URL, DEFAULT_CONFIG } from '../constants'
import createMockRequest from '../create-mock-request'

describe('handleSiteRequest', () => {
  const mockRequest = createMockRequest('/llms.txt')

  describe('basic functionality', () => {
    it('should return markdown response with default config', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
          description: 'Test description',
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(response.headers.get('content-type')).toContain('text/markdown')
      expect(text).toContain('# Test Site')
      expect(text).toContain('> Test description')
    })

    it('should handle minimal config with only title', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Minimal Site',
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# Minimal Site')
      expect(text).not.toContain('>')
    })

    it('should include sections from default config', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Site with Sections',
          sections: [
            {
              title: 'Documentation',
              items: [
                { title: 'Guide', url: '/guide', description: 'User guide' },
              ],
            },
          ],
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# Site with Sections')
      expect(text).toContain('## Documentation')
      expect(text).toContain('- [Guide](/guide): User guide')
    })

    it('should include optional section from default config', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Site with Optional',
          optional: [
            { title: 'Blog', url: '/blog', description: 'Our blog' },
          ],
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# Site with Optional')
      expect(text).toContain('## Optional')
      expect(text).toContain('- [Blog](/blog): Our blog')
    })
  })

  describe('with custom generator', () => {
    it('should use custom generator when provided', async () => {
      const customGenerator = vi.fn(() => '# Custom Generated Content')

      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
        },
        generator: customGenerator,
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(customGenerator).toHaveBeenCalled()
      expect(text).toBe('# Custom Generated Content')
    })

    it('should pass config and pages to custom generator', async () => {
      const customGenerator = vi.fn((config, pages) => {
        return `# ${config.title}\nPages: ${pages.length}`
      })

      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
        },
        generator: customGenerator,
      }

      const response = await handleSiteRequest(mockRequest, config)
      await response.text()

      expect(customGenerator).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test Site' }),
        expect.any(Array),
      )
    })

    it('should throw error when custom generator returns falsy value', async () => {
      const customGenerator = vi.fn(() => null)

      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
        },
        generator: customGenerator,
      }

      await expect(handleSiteRequest(mockRequest, config)).rejects.toThrow(
        'Couldn\'t generate Config',
      )
    })

    it('should throw error when custom generator returns undefined', async () => {
      const customGenerator = vi.fn(() => undefined)

      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
        },
        generator: customGenerator,
      }

      await expect(handleSiteRequest(mockRequest, config)).rejects.toThrow(
        'Couldn\'t generate Config',
      )
    })

    it('should throw error when custom generator returns empty string', async () => {
      const customGenerator = vi.fn(() => '')

      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
        },
        generator: customGenerator,
      }

      await expect(handleSiteRequest(mockRequest, config)).rejects.toThrow(
        'Couldn\'t generate Config',
      )
    })
  })

  describe('with pre-existing pages', () => {
    it('should include pages from config', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
        },
        pages: [
          {
            route: '/manual-page',
            config: {
              title: 'Manual Page',
              description: 'Manually added',
            },
          },
        ],
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('## Pages')
      expect(text).toContain('- [Manual Page](/manual-page): Manually added')
    })

    it('should merge pre-existing pages with discovered pages', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
        },
        autoDiscovery: AUTO_DISCOVERY,
        pages: [
          {
            route: '/manual',
            config: {
              title: 'Manual',
            },
          },
        ],
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('## Pages')
      expect(text).toContain('- [Manual](/manual)')
    })
  })

  describe('with auto-discovery enabled', () => {
    it('should discover pages from fixtures and emit them under section headings (not under ## Pages)', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: DEFAULT_CONFIG,
        autoDiscovery: AUTO_DISCOVERY,
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      // No user pages were supplied, so the legacy `## Pages` block must not
      // be emitted. Discovered routes live inside section headings instead.
      expect(text).not.toContain('## Pages')
      expect(text).toContain('## Main Pages')
      expect(text).toContain('## Nested')
      expect(response.status).toBe(200)
    })

    it('should merge discovered config with default config', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Default Title',
          description: 'Default Description',
        },
        autoDiscovery: AUTO_DISCOVERY,
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      // Should contain elements from both discovered and default config
      expect(text).toContain('#')
      expect(response.status).toBe(200)
    })

    it('should handle auto-discovery with boolean true', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: DEFAULT_CONFIG,
        autoDiscovery: true,
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('#')
      // No user pages → no `## Pages` block; discovered sections only.
      expect(text).not.toContain('## Pages')
      expect(response.status).toBe(200)
    })

    it('should merge discovered sections with default config (preserving user sections)', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'My Site',
          description: 'Custom description',
          sections: [
            {
              title: 'Custom Section',
              items: [
                { title: 'Custom Item', url: '/custom' },
              ],
            },
          ],
        },
        autoDiscovery: AUTO_DISCOVERY,
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# My Site')
      expect(text).toContain('> Custom description')
      expect(text).toContain('## Custom Section')
      expect(text).toContain('- [Custom Item](/custom)')
      // User did not supply any `pages` entries, so `## Pages` must not
      // appear; discovered routes now live under section headings.
      expect(text).not.toContain('## Pages')
      expect(text).toContain('## Main Pages')
      expect(response.status).toBe(200)
    })

    it('emits a discovered route exactly once when there is no user override', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: DEFAULT_CONFIG,
        autoDiscovery: AUTO_DISCOVERY,
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()
      // Discovered section URLs are absolute (baseUrl + route); the previous
      // double-render also emitted a relative `[Title](/all-exports)` under
      // `## Pages`. Count both forms — together they should now appear once.
      const absoluteHits = text.split(`](${BASE_URL}/all-exports)`).length - 1
      const relativeHits = text.split('](/all-exports)').length - 1
      expect(absoluteHits + relativeHits).toBe(1)
    })

    it('lets a user-supplied page override a discovered route by route (de-dup, user wins)', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: DEFAULT_CONFIG,
        autoDiscovery: AUTO_DISCOVERY,
        pages: [
          {
            route: '/all-exports',
            config: {
              title: 'OVERRIDE',
              description: 'User override wins',
            },
          },
        ],
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      // The user override goes in `## Pages` (relative URL form). The
      // discovered absolute-URL entry inside the section is filtered out, so
      // the route is referenced exactly once across the document.
      const absoluteHits = text.split(`](${BASE_URL}/all-exports)`).length - 1
      const relativeHits = text.split('](/all-exports)').length - 1
      expect(absoluteHits).toBe(0)
      expect(relativeHits).toBe(1)
      expect(text).toContain('## Pages')
      expect(text).toContain('- [OVERRIDE](/all-exports): User override wins')
    })

    it('de-dupes user-supplied pages by route (user-wins, first occurrence)', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: DEFAULT_CONFIG,
        pages: [
          { route: '/dup', config: { title: 'First' } },
          { route: '/dup', config: { title: 'Second' } },
        ],
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()
      const occurrences = text.split('/dup').length - 1
      expect(occurrences).toBe(1)
      expect(text).toContain('- [First](/dup)')
      expect(text).not.toContain('- [Second](/dup)')
    })
  })

  describe('error handling', () => {
    it('should throw error when config has no title', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: '',
        },
      }

      await expect(handleSiteRequest(mockRequest, config)).rejects.toThrow(
        'LLMs.txt configuration must have a title.',
      )
    })

    it('should throw error when config title is missing', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        // @ts-expect-error Testing missing title
        defaultConfig: {
          description: 'No title',
        },
      }

      await expect(handleSiteRequest(mockRequest, config)).rejects.toThrow(
        'LLMs.txt configuration must have a title.',
      )
    })

    it('should throw error when defaultConfig is undefined', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: undefined,
      }

      await expect(handleSiteRequest(mockRequest, config)).rejects.toThrow(
        'LLMs.txt configuration must have a title.',
      )
    })

    it('should throw error when defaultConfig is null', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        // @ts-expect-error Testing null
        defaultConfig: null,
      }

      await expect(handleSiteRequest(mockRequest, config)).rejects.toThrow(
        'LLMs.txt configuration must have a title.',
      )
    })
  })

  describe('edge cases', () => {
    it('should handle config with empty sections array', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Empty Sections',
          sections: [],
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# Empty Sections')
      expect(text).not.toContain('## ')
    })

    it('should handle config with empty optional array', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Empty Optional',
          optional: [],
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# Empty Optional')
      expect(text).not.toContain('## Optional')
    })

    it('should handle request with different pathname', async () => {
      const customRequest = new NextRequest(`${BASE_URL}/custom-path`)

      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
        },
      }

      const response = await handleSiteRequest(customRequest, config)
      const text = await response.text()

      expect(text).toContain('# Test Site')
    })

    it('should handle autoDiscovery false with no pages', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'No Discovery',
        },
        autoDiscovery: false,
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# No Discovery')
      expect(text).not.toContain('## Pages')
    })

    it('should handle very long titles', async () => {
      const longTitle = 'A'.repeat(500)

      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: longTitle,
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain(`# ${longTitle}`)
    })

    it('should handle special characters in title', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Site with "quotes" & <special> chars',
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# Site with "quotes" & <special> chars')
    })

    it('should handle Unicode characters in title', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: '文档站点 🚀',
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# 文档站点 🚀')
    })

    it('should trim whitespace from title', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: '   Trimmed Title   ',
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# Trimmed Title')
      expect(text).not.toContain('#    Trimmed Title')
    })
  })

  describe('response properties', () => {
    it('should return response with correct content type', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test',
        },
      }

      const response = await handleSiteRequest(mockRequest, config)

      expect(response.headers.get('content-type')).toMatch(/text\/markdown/)
      expect(response.headers.get('content-type')).toMatch(/charset=utf-8/i)
    })

    it('should return status 200', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test',
        },
      }

      const response = await handleSiteRequest(mockRequest, config)

      expect(response.status).toBe(200)
    })

    it('should return valid markdown content', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Test Site',
          description: 'Description',
          sections: [
            {
              title: 'Section',
              items: [
                { title: 'Link', url: '/link' },
              ],
            },
          ],
        },
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toMatch(/^# Test Site/)
      expect(text).toContain('> Description')
      expect(text).toContain('## Section')
      expect(text).toContain('- [Link](/link)')
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete configuration with all features', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: BASE_URL,
        defaultConfig: {
          title: 'Complete Site',
          description: 'A complete example',
          sections: [
            {
              title: 'Main',
              description: 'Main section',
              items: [
                { title: 'Home', url: '/', description: 'Homepage' },
              ],
            },
          ],
          optional: [
            { title: 'Blog', url: '/blog' },
          ],
        },
        autoDiscovery: AUTO_DISCOVERY,
        pages: [
          {
            route: '/custom',
            config: { title: 'Custom Page' },
          },
        ],
      }

      const response = await handleSiteRequest(mockRequest, config)
      const text = await response.text()

      expect(text).toContain('# Complete Site')
      expect(text).toContain('> A complete example')
      // User supplied a `/custom` page → `## Pages` still rendered for it.
      expect(text).toContain('## Pages')
      expect(text).toContain('- [Custom Page](/custom)')
      expect(text).toContain('## Main')
      expect(text).toContain('## Optional')
    })
  })
})
