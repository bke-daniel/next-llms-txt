import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { getAutoDiscoveryConfig } from '../../src/get-auto-discovery-config'
import { LLMS_TXT_HANDLER_CONFIG } from '../constants'

describe('uncovered logic tests', () => {
  const custom = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)

  // TODO implement
  it.skip('merges config in constructor', () => {

  })

  it('discovers pages from pagesDir', async () => {
    const pages = await custom.discoverPages()
    expect(Array.isArray(pages)).toBe(true)
  })

  it('walkDir discovers .tsx files', async () => {
    // walkDir is private, but discoverPages uses it internally
    const pages = await custom.discoverPages()
    expect(pages.some(p => p.filePath.endsWith('page.tsx'))).toBe(true)
  })

  it('getAutoDiscoveryConfig throws if baseUrl missing', () => {
    expect(() => getAutoDiscoveryConfig({} as any)).toThrow(/baseUrl/)
  })
})
