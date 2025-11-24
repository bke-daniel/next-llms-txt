import type { NextRequest } from 'next/server'
import type { LLMsTxtHandlerConfig } from '../../src/types'
import handlePageRequest from '../../src/handle-page-request'
import handleSiteRequest from '../../src/handle-site-request'
import { createLLmsTxt } from '../../src/handler'
import mergeConfig from '../../src/merge-with-default-config'
import validateConfig from '../../src/validate-config'

jest.mock('../../src/handle-page-request')
jest.mock('../../src/handle-site-request')
jest.mock('../../src/merge-with-default-config')
jest.mock('../../src/validate-config')

const mockHandlePageRequest = handlePageRequest as jest.MockedFunction<typeof handlePageRequest>
const mockHandleSiteRequest = handleSiteRequest as jest.MockedFunction<typeof handleSiteRequest>
const mockMergeConfig = mergeConfig as jest.MockedFunction<typeof mergeConfig>
const mockValidateConfig = validateConfig as jest.MockedFunction<typeof validateConfig>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('createLLmsTxt', () => {
  it('should return an object with GET method', () => {
    const config: LLMsTxtHandlerConfig = {
      baseUrl: 'http://example.com',
    }

    const handler = createLLmsTxt(config)

    expect(handler).toHaveProperty('GET')
    expect(typeof handler.GET).toBe('function')
  })

  describe('get method', () => {
    it('should route to handleSiteRequest for /llms.txt', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
      }
      const mergedConfig = { ...config, autoDiscovery: false } as any
      const request = {
        url: 'http://example.com/llms.txt',
      } as NextRequest

      mockValidateConfig.mockReturnValue(config)
      mockMergeConfig.mockReturnValue(mergedConfig)
      mockHandleSiteRequest.mockResolvedValue({ status: 200 } as any)

      const handler = createLLmsTxt(config)
      await handler.GET(request)

      expect(mockValidateConfig).toHaveBeenCalledWith(config)
      expect(mockMergeConfig).toHaveBeenCalledWith(config)
      expect(mockHandleSiteRequest).toHaveBeenCalledWith(request, mergedConfig)
      expect(mockHandlePageRequest).not.toHaveBeenCalled()
    })

    it('should route to handlePageRequest for .html.md files', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
      }
      const mergedConfig = { ...config, autoDiscovery: true } as any
      const request = {
        url: 'http://example.com/about.html.md',
      } as NextRequest

      mockValidateConfig.mockReturnValue(config)
      mockMergeConfig.mockReturnValue(mergedConfig)
      mockHandlePageRequest.mockResolvedValue({ status: 200 } as any)

      const handler = createLLmsTxt(config)
      await handler.GET(request)

      expect(mockHandlePageRequest).toHaveBeenCalledWith(request, mergedConfig)
      expect(mockHandleSiteRequest).not.toHaveBeenCalled()
    })

    it('should handle errors and return 500', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
      }
      const request = {
        url: 'http://example.com/llms.txt',
      } as NextRequest

      mockValidateConfig.mockReturnValue(config)
      mockMergeConfig.mockReturnValue(config as any)
      mockHandleSiteRequest.mockImplementation(() => {
        throw new Error('Test error')
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const handler = createLLmsTxt(config)
      const response = await handler.GET(request)

      expect(response.status).toBe(500)
      const text = await response.text()
      expect(text).toBe('Error generating llms.txt')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[next-llms-txt] Error generating llms.txt:',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })

    it('should handle nested paths for .html.md', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
      }
      const mergedConfig = { ...config, autoDiscovery: true } as any
      const request = {
        url: 'http://example.com/services/consulting.html.md',
      } as NextRequest

      mockValidateConfig.mockReturnValue(config)
      mockMergeConfig.mockReturnValue(mergedConfig)
      mockHandlePageRequest.mockResolvedValue({ status: 200 } as any)

      const handler = createLLmsTxt(config)
      await handler.GET(request)

      expect(mockHandlePageRequest).toHaveBeenCalledWith(request, mergedConfig)
    })

    it('should validate config before merging', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
      }
      const validatedConfig = { ...config, validated: true } as any
      const mergedConfig = { ...validatedConfig, merged: true } as any
      const request = {
        url: 'http://example.com/llms.txt',
      } as NextRequest

      mockValidateConfig.mockReturnValue(validatedConfig)
      mockMergeConfig.mockReturnValue(mergedConfig)
      mockHandleSiteRequest.mockResolvedValue({ status: 200 } as any)

      const handler = createLLmsTxt(config)
      await handler.GET(request)

      expect(mockValidateConfig).toHaveBeenCalledWith(config)
      expect(mockMergeConfig).toHaveBeenCalledWith(validatedConfig)
    })

    it('should throw validation errors directly', () => {
      const config: LLMsTxtHandlerConfig = {} as any

      mockValidateConfig.mockImplementation(() => {
        throw new Error('Invalid config')
      })

      const handler = createLLmsTxt(config)
      const request = {
        url: 'http://example.com/llms.txt',
      } as NextRequest

      expect(async () => await handler.GET(request)).rejects.toThrow('Invalid config')
    })

    it('should throw merge errors directly', () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
      }

      mockValidateConfig.mockReturnValue(config)
      mockMergeConfig.mockImplementation(() => {
        throw new Error('Merge failed')
      })

      const handler = createLLmsTxt(config)
      const request = {
        url: 'http://example.com/llms.txt',
      } as NextRequest

      expect(async () => await handler.GET(request)).rejects.toThrow('Merge failed')
    })
  })

  describe('integration scenarios', () => {
    it('should handle multiple requests with same handler instance', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
      }
      const mergedConfig = { ...config, autoDiscovery: true } as any

      mockValidateConfig.mockReturnValue(config)
      mockMergeConfig.mockReturnValue(mergedConfig)
      mockHandleSiteRequest.mockResolvedValue({ status: 200 } as any)
      mockHandlePageRequest.mockResolvedValue({ status: 200 } as any)

      const handler = createLLmsTxt(config)

      const request1 = { url: 'http://example.com/llms.txt' } as NextRequest
      const request2 = { url: 'http://example.com/about.html.md' } as NextRequest

      await handler.GET(request1)
      await handler.GET(request2)

      expect(mockHandleSiteRequest).toHaveBeenCalledTimes(1)
      expect(mockHandlePageRequest).toHaveBeenCalledTimes(1)
    })

    it('should handle complex URL with query params', async () => {
      const config: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
      }
      const mergedConfig = { ...config, autoDiscovery: false } as any
      const request = {
        url: 'http://example.com/llms.txt?foo=bar&baz=qux',
      } as NextRequest

      mockValidateConfig.mockReturnValue(config)
      mockMergeConfig.mockReturnValue(mergedConfig)
      mockHandleSiteRequest.mockResolvedValue({ status: 200 } as any)

      const handler = createLLmsTxt(config)
      await handler.GET(request)

      expect(mockHandleSiteRequest).toHaveBeenCalled()
    })
  })
})
