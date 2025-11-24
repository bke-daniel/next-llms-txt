import type { NextRequest } from 'next/server'
import type { LLMsTxtHandlerConfig, PageInfo } from '../../src/types'
import createMarkdownResponse from '../../src/create-markdown-response'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { generateLLMsTxt } from '../../src/generator'
import handlePageRequest from '../../src/handle-page-request'

jest.mock('../../src/discovery')
jest.mock('../../src/create-markdown-response')
jest.mock('../../src/generator')

const mockDiscoverPages = jest.fn()
const mockCreateMarkdownResponse = createMarkdownResponse as jest.MockedFunction<typeof createMarkdownResponse>
const mockGenerateLLMsTxt = generateLLMsTxt as jest.MockedFunction<typeof generateLLMsTxt>

beforeEach(() => {
  jest.clearAllMocks()
    ; (LLMsTxtAutoDiscovery as jest.Mock).mockImplementation(() => ({
      discoverPages: mockDiscoverPages,
    }))
})

describe('handlePageRequest', () => {
  describe('when autoDiscovery is disabled', () => {
    it('should return 400 error when autoDiscovery is false', async () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: false,
      }
      const request = {
        url: 'http://example.com/about.html.md',
      } as NextRequest

      const response = await handlePageRequest(request, handlerConfig)

      expect(response.status).toBe(400)
      const text = await response.text()
      expect(text).toBe('Auto-discovery must be enabled for page-specific llms.txt files.')
    })

    it('should return 400 error when autoDiscovery is undefined', async () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
      }
      const request = {
        url: 'http://example.com/about.html.md',
      } as NextRequest

      const response = await handlePageRequest(request, handlerConfig)

      expect(response.status).toBe(400)
    })
  })

  describe('when page is not found', () => {
    it('should return 404 when page does not exist', async () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
      }
      const request = {
        url: 'http://example.com/nonexistent.html.md',
      } as NextRequest

      mockDiscoverPages.mockResolvedValue([])

      const response = await handlePageRequest(request, handlerConfig)

      expect(response.status).toBe(404)
      const text = await response.text()
      expect(text).toBe('Page not found or no llms.txt configuration available.')
    })

    it('should return 404 when page exists but has no config', async () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
      }
      const request = {
        url: 'http://example.com/about.html.md',
      } as NextRequest

      const pages: PageInfo[] = [
        {
          route: '/about',
          filePath: '/app/about/page.tsx',
          hasLLMsTxtExport: false,
          hasMetadataFallback: false,
          warnings: [],
        },
      ]
      mockDiscoverPages.mockResolvedValue(pages)

      const response = await handlePageRequest(request, handlerConfig)

      expect(response.status).toBe(404)
    })
  })

  describe('when page is found', () => {
    it('should return markdown response for valid page', async () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
      }
      const request = {
        url: 'http://example.com/about.html.md',
      } as NextRequest

      const pages: PageInfo[] = [
        {
          route: '/about',
          filePath: '/app/about/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: {
            title: 'About Page',
            description: 'About us',
          },
          warnings: [],
        },
      ]
      mockDiscoverPages.mockResolvedValue(pages)
      mockGenerateLLMsTxt.mockReturnValue('# About Page\n\n> About us')
      mockCreateMarkdownResponse.mockReturnValue({
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      } as any)

      const response = await handlePageRequest(request, handlerConfig)

      expect(mockGenerateLLMsTxt).toHaveBeenCalledWith({
        title: 'About Page',
        description: 'About us',
      })
      expect(mockCreateMarkdownResponse).toHaveBeenCalledWith('# About Page\n\n> About us')
      expect(response.status).toBe(200)
    })

    it('should strip .html.md extension correctly', async () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
      }
      const request = {
        url: 'http://example.com/services/consulting.html.md',
      } as NextRequest

      const pages: PageInfo[] = [
        {
          route: '/services/consulting',
          filePath: '/app/services/consulting/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: {
            title: 'Consulting',
          },
          warnings: [],
        },
      ]
      mockDiscoverPages.mockResolvedValue(pages)
      mockGenerateLLMsTxt.mockReturnValue('# Consulting')
      mockCreateMarkdownResponse.mockReturnValue({ status: 200 } as any)

      const response = await handlePageRequest(request, handlerConfig)

      expect(response.status).toBe(200)
    })

    it('should normalize paths when matching', async () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
      }
      const request = {
        url: 'http://example.com/about/index.html.md',
      } as NextRequest

      const pages: PageInfo[] = [
        {
          route: '/about',
          filePath: '/app/about/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: {
            title: 'About',
          },
          warnings: [],
        },
      ]
      mockDiscoverPages.mockResolvedValue(pages)
      mockGenerateLLMsTxt.mockReturnValue('# About')
      mockCreateMarkdownResponse.mockReturnValue({ status: 200 } as any)

      const response = await handlePageRequest(request, handlerConfig)

      expect(response.status).toBe(200)
    })
  })

  describe('custom generator', () => {
    it('should use custom generator when provided', async () => {
      const customGenerator = jest.fn().mockReturnValue('Custom content')
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
        generator: customGenerator,
      }
      const request = {
        url: 'http://example.com/about.html.md',
      } as NextRequest

      const pageConfig = {
        title: 'About Page',
        description: 'About us',
      }
      const pages: PageInfo[] = [
        {
          route: '/about',
          filePath: '/app/about/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: pageConfig,
          warnings: [],
        },
      ]
      mockDiscoverPages.mockResolvedValue(pages)
      mockCreateMarkdownResponse.mockReturnValue({ status: 200 } as any)

      await handlePageRequest(request, handlerConfig)

      expect(customGenerator).toHaveBeenCalledWith(pageConfig)
      expect(mockGenerateLLMsTxt).not.toHaveBeenCalled()
      expect(mockCreateMarkdownResponse).toHaveBeenCalledWith('Custom content')
    })

    it('should return 400 when custom generator returns empty string', async () => {
      const customGenerator = jest.fn().mockReturnValue('')
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
        generator: customGenerator,
      }
      const request = {
        url: 'http://example.com/about.html.md',
      } as NextRequest

      const pages: PageInfo[] = [
        {
          route: '/about',
          filePath: '/app/about/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: {
            title: 'About',
          },
          warnings: [],
        },
      ]
      mockDiscoverPages.mockResolvedValue(pages)

      const response = await handlePageRequest(request, handlerConfig)

      expect(response.status).toBe(400)
    })

    it('should return 400 when custom generator returns undefined', async () => {
      const customGenerator = jest.fn().mockReturnValue(undefined)
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
        generator: customGenerator,
      }
      const request = {
        url: 'http://example.com/about.html.md',
      } as NextRequest

      const pages: PageInfo[] = [
        {
          route: '/about',
          filePath: '/app/about/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: {
            title: 'About',
          },
          warnings: [],
        },
      ]
      mockDiscoverPages.mockResolvedValue(pages)

      const response = await handlePageRequest(request, handlerConfig)

      expect(response.status).toBe(400)
    })
  })

  describe('edge cases', () => {
    it('should handle root page request', async () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
      }
      const request = {
        url: 'http://example.com/index.html.md',
      } as NextRequest

      const pages: PageInfo[] = [
        {
          route: '/',
          filePath: '/app/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: {
            title: 'Home',
          },
          warnings: [],
        },
      ]
      mockDiscoverPages.mockResolvedValue(pages)
      mockGenerateLLMsTxt.mockReturnValue('# Home')
      mockCreateMarkdownResponse.mockReturnValue({ status: 200 } as any)

      const response = await handlePageRequest(request, handlerConfig)

      expect(response.status).toBe(200)
    })

    it('should handle multiple pages and find correct one', async () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
      }
      const request = {
        url: 'http://example.com/services.html.md',
      } as NextRequest

      const pages: PageInfo[] = [
        {
          route: '/about',
          filePath: '/app/about/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: { title: 'About' },
          warnings: [],
        },
        {
          route: '/services',
          filePath: '/app/services/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: { title: 'Services' },
          warnings: [],
        },
        {
          route: '/contact',
          filePath: '/app/contact/page.tsx',
          hasLLMsTxtExport: true,
          hasMetadataFallback: false,
          config: { title: 'Contact' },
          warnings: [],
        },
      ]
      mockDiscoverPages.mockResolvedValue(pages)
      mockGenerateLLMsTxt.mockReturnValue('# Services')
      mockCreateMarkdownResponse.mockReturnValue({ status: 200 } as any)

      const response = await handlePageRequest(request, handlerConfig)

      expect(mockGenerateLLMsTxt).toHaveBeenCalledWith({ title: 'Services' })
      expect(response.status).toBe(200)
    })
  })
})
