import type { LLMsTxtHandlerConfig } from '../../src/types'
import { getAutoDiscoveryConfig } from '../../src/get-auto-discovery-config'

describe('getAutoDiscoveryConfig', () => {
  it('returns autoDiscovery object if present', () => {
    const config: LLMsTxtHandlerConfig = { autoDiscovery: { baseUrl: 'https://foo.com' } }
    expect(getAutoDiscoveryConfig(config as any)).toEqual({ baseUrl: 'https://foo.com' })
  })

  it('throws if baseUrl missing', () => {
    expect(() => getAutoDiscoveryConfig({} as any)).toThrow(/baseUrl/)
  })

  it('returns baseUrl from handlerConfig if autoDiscovery is not object', () => {
    const config: LLMsTxtHandlerConfig = { baseUrl: 'https://bar.com' }
    expect(getAutoDiscoveryConfig(config as any)).toEqual({ baseUrl: 'https://bar.com' })
  })
})
