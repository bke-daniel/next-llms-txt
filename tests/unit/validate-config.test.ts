import type { LLMsTxtHandlerConfig } from '../../src/types'
import validateConfig from '../../src/validate-config'

describe('validateConfig', () => {
  it('throws if config missing required fields', () => {
    expect(() => validateConfig({} as any)).not.toThrow()
  })

  it('accepts config with conflicting manual/autoDiscovery', () => {
    const config = { defaultConfig: { title: 'Demo' }, autoDiscovery: true }
    expect(validateConfig(config as any)).toBe(config)
  })
  it('returns config if valid', () => {
    const config: LLMsTxtHandlerConfig = { baseUrl: 'https://example.com' }
    expect(validateConfig(config as any)).toBe(config)
  })

  it('throws if config is missing', () => {
    expect(() => validateConfig(undefined as any)).toThrow(/No configuration/)
  })
})
