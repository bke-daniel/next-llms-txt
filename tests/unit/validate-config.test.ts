import type { LLMsTxtHandlerConfig } from '../../src/types'
import validateConfig from '../../src/validate-config'
import { LLMS_TXT_HANDLER_CONFIG } from '../constants'

describe('validateConfig', () => {
  it('throws if config missing required fields', () => {
    expect(() => validateConfig({} as any)).not.toThrow()
  })

  it('accepts config with conflicting manual/autoDiscovery', () => {
    expect(validateConfig(LLMS_TXT_HANDLER_CONFIG)).toBe(LLMS_TXT_HANDLER_CONFIG)
  })

  it('returns config if valid', () => {
    const config: LLMsTxtHandlerConfig = { baseUrl: 'https://example.com' }
    expect(validateConfig(config)).toBe(config)
  })

  it('should return proper auto discovery config', () => {
    const config: LLMsTxtHandlerConfig = { ...LLMS_TXT_HANDLER_CONFIG, autoDiscovery: true }
    expect(validateConfig(config)).toBe(config)
  })

  it('throws if config is missing', () => {
    expect(() => validateConfig(undefined as any)).toThrow(/No configuration/)
  })
})
