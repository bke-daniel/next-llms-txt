import type { AutoDiscoveryConfig, LLMsTxtHandlerConfig } from '../../src/types'
import { DEFAULT_CONFIG } from '../../src/constants'
import { getAutoDiscoveryConfig } from '../../src/get-auto-discovery-config'

describe('getAutoDiscoveryConfig', () => {
  describe('when autoDiscovery is an object', () => {
    it('should return the autoDiscovery object as-is', () => {
      const config: AutoDiscoveryConfig = {
        appDir: 'custom/app',
        rootDir: '/custom/root',
      }
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: config,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(config)
      expect(result.appDir).toBe('custom/app')
      expect(result.rootDir).toBe('/custom/root')
    })

    it('should return the autoDiscovery object even when baseUrl is missing', () => {
      const config: AutoDiscoveryConfig = {
        appDir: 'src/app',
        rootDir: '/project/root',
      }
      const handlerConfig: LLMsTxtHandlerConfig = {
        autoDiscovery: config,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(config)
    })

    it('should return the autoDiscovery object with only appDir', () => {
      const config: AutoDiscoveryConfig = {
        appDir: 'app',
      }
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://localhost:3000',
        autoDiscovery: config,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(config)
      expect(result.appDir).toBe('app')
      expect(result.rootDir).toBeUndefined()
    })

    it('should return the autoDiscovery object with only rootDir', () => {
      const config: AutoDiscoveryConfig = {
        rootDir: '/root',
      }
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://localhost:3000',
        autoDiscovery: config,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(config)
      expect(result.rootDir).toBe('/root')
      expect(result.appDir).toBeUndefined()
    })

    it('should return empty autoDiscovery object if provided', () => {
      const config: AutoDiscoveryConfig = {}
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://localhost:3000',
        autoDiscovery: config,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(config)
      expect(result).toEqual({})
    })
  })

  describe('when autoDiscovery is not an object', () => {
    it('should throw error when baseUrl is missing and autoDiscovery is true', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        autoDiscovery: true,
      }

      expect(() => getAutoDiscoveryConfig(handlerConfig)).toThrow(
        'A `baseUrl` is required for auto-discovery.',
      )
    })

    it('should throw error when baseUrl is missing and autoDiscovery is false', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        autoDiscovery: false,
      }

      expect(() => getAutoDiscoveryConfig(handlerConfig)).toThrow(
        'A `baseUrl` is required for auto-discovery.',
      )
    })

    it('should throw error when baseUrl is missing and autoDiscovery is undefined', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        autoDiscovery: undefined,
      }

      expect(() => getAutoDiscoveryConfig(handlerConfig)).toThrow(
        'A `baseUrl` is required for auto-discovery.',
      )
    })

    it('should throw error when baseUrl is empty string and autoDiscovery is true', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: '',
        autoDiscovery: true,
      }

      expect(() => getAutoDiscoveryConfig(handlerConfig)).toThrow(
        'A `baseUrl` is required for auto-discovery.',
      )
    })

    it('should return default config when baseUrl exists and autoDiscovery is undefined', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: undefined,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(DEFAULT_CONFIG.autoDiscovery)
      expect(result.appDir).toBe(DEFAULT_CONFIG.autoDiscovery.appDir)
      expect(result.rootDir).toBe(DEFAULT_CONFIG.autoDiscovery.rootDir)
    })

    it('should return default config when baseUrl exists and autoDiscovery is false', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: false,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(DEFAULT_CONFIG.autoDiscovery)
    })

    it('should return truthy autoDiscovery value when baseUrl exists and autoDiscovery is true', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle baseUrl with different protocols', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'https://secure.example.com',
        autoDiscovery: true,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(true)
    })

    it('should handle baseUrl with port', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://localhost:8080',
        autoDiscovery: true,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(true)
    })

    it('should handle baseUrl with trailing slash', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com/',
        autoDiscovery: true,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(true)
    })

    it('should handle baseUrl with path', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com/subpath',
        autoDiscovery: true,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(true)
    })

    it('should handle null baseUrl as falsy', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        // @ts-expect-error Testing null for edge case
        baseUrl: null,
        autoDiscovery: true,
      }

      expect(() => getAutoDiscoveryConfig(handlerConfig)).toThrow(
        'A `baseUrl` is required for auto-discovery.',
      )
    })

    it('should return truthy autoDiscovery when baseUrl is whitespace', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: '   ',
        autoDiscovery: true,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(true)
    })

    it('should handle autoDiscovery with both fields populated', () => {
      const config: AutoDiscoveryConfig = {
        appDir: 'src/app',
        rootDir: '/absolute/path',
      }
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: config,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(config)
      expect(result.appDir).toBe('src/app')
      expect(result.rootDir).toBe('/absolute/path')
    })

    it('should not mutate the input config', () => {
      const config: AutoDiscoveryConfig = {
        appDir: 'original/app',
        rootDir: '/original/root',
      }
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: config,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(config)
      expect(config.appDir).toBe('original/app')
      expect(config.rootDir).toBe('/original/root')
    })

    it('should handle 0 as falsy for baseUrl check', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        // @ts-expect-error Testing number for edge case
        baseUrl: 0,
        autoDiscovery: true,
      }

      expect(() => getAutoDiscoveryConfig(handlerConfig)).toThrow(
        'A `baseUrl` is required for auto-discovery.',
      )
    })
  })

  describe('type coercion behavior', () => {
    it('should return number when autoDiscovery is a truthy number', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        // @ts-expect-error Testing number for type coercion
        autoDiscovery: 123,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(123)
    })

    it('should return string when autoDiscovery is a truthy string', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        // @ts-expect-error Testing string for type coercion
        autoDiscovery: 'enabled',
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe('enabled')
    })

    it('should treat array as object and return it', () => {
      const arrayConfig = ['not', 'a', 'config']
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        // @ts-expect-error Testing array for type coercion
        autoDiscovery: arrayConfig,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      expect(result).toBe(arrayConfig)
    })

    it('should return null when autoDiscovery is null (typeof null is object)', () => {
      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        // @ts-expect-error Testing null for type coercion
        autoDiscovery: null,
      }

      const result = getAutoDiscoveryConfig(handlerConfig)

      // In JavaScript, typeof null === 'object', so it returns null
      expect(result).toBe(null)
    })
  })

  describe('integration with DEFAULT_CONFIG', () => {
    it('should return DEFAULT_CONFIG.autoDiscovery for falsy non-object values', () => {
      const handlerConfig1: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example1.com',
        autoDiscovery: false,
      }
      const handlerConfig2: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example2.com',
        autoDiscovery: undefined,
      }

      const result1 = getAutoDiscoveryConfig(handlerConfig1)
      const result2 = getAutoDiscoveryConfig(handlerConfig2)

      expect(result1).toBe(result2)
      expect(result1).toBe(DEFAULT_CONFIG.autoDiscovery)
    })

    it('should not modify DEFAULT_CONFIG when returning it', () => {
      const originalAppDir = DEFAULT_CONFIG.autoDiscovery.appDir
      const originalRootDir = DEFAULT_CONFIG.autoDiscovery.rootDir

      const handlerConfig: LLMsTxtHandlerConfig = {
        baseUrl: 'http://example.com',
        autoDiscovery: true,
      }

      getAutoDiscoveryConfig(handlerConfig)

      expect(DEFAULT_CONFIG.autoDiscovery.appDir).toBe(originalAppDir)
      expect(DEFAULT_CONFIG.autoDiscovery.rootDir).toBe(originalRootDir)
    })
  })
})
