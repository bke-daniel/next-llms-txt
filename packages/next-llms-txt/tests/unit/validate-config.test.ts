import type { LLMsTxtHandlerConfig } from '../../src/types'
import validateConfig from '../../src/validate-config'
import { LLMS_TXT_HANDLER_CONFIG } from '../constants'

describe('validateConfig', () => {
  it('throws if config is missing', () => {
    expect(() => validateConfig(undefined as any)).toThrow(/No configuration/)
  })

  it('throws if config has neither title, pages, nor enabled autoDiscovery', () => {
    expect(() => validateConfig({} as any)).toThrow(
      /defaultConfig.*title.*pages.*autoDiscovery/,
    )
  })

  it('throws if autoDiscovery:false and no defaultConfig.title nor pages are provided', () => {
    const config: LLMsTxtHandlerConfig = {
      baseUrl: 'https://example.com',
      autoDiscovery: false,
    }
    expect(() => validateConfig(config)).toThrow(
      /defaultConfig.*title.*pages.*autoDiscovery/,
    )
  })

  it('accepts a config with a defaultConfig.title only', () => {
    const config: LLMsTxtHandlerConfig = {
      baseUrl: 'https://example.com',
      defaultConfig: { title: 'My Site' },
    }
    expect(validateConfig(config)).toBe(config)
  })

  it('accepts a config with only a non-empty pages array', () => {
    const config: LLMsTxtHandlerConfig = {
      baseUrl: 'https://example.com',
      autoDiscovery: false,
      pages: [{ route: '/about', config: { title: 'About' } }],
    }
    expect(validateConfig(config)).toBe(config)
  })

  it('accepts a config with autoDiscovery:true', () => {
    const config: LLMsTxtHandlerConfig = {
      baseUrl: 'https://example.com',
      autoDiscovery: true,
    }
    expect(validateConfig(config)).toBe(config)
  })

  it('accepts a full handler config combining title + autoDiscovery', () => {
    expect(validateConfig(LLMS_TXT_HANDLER_CONFIG)).toBe(LLMS_TXT_HANDLER_CONFIG)
  })
})
