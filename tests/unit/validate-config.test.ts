import type { LLMsTxtHandlerConfig } from '../../src/types'
import validateConfig from '../../src/validate-config'

describe('validateConfig', () => {
  it('returns config if valid', () => {
    const config: LLMsTxtHandlerConfig = { baseUrl: 'https://example.com' }
    expect(validateConfig(config as any)).toBe(config)
  })

  it('throws if config is missing', () => {
    expect(() => validateConfig(undefined as any)).toThrow(/No configuration/)
  })
})
