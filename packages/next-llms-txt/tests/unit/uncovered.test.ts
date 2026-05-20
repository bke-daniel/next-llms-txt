import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { LLMS_TXT_HANDLER_CONFIG } from '../constants'

describe('uncovered logic tests', () => {
  const custom = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)

  it('discovers pages from the configured app directory', async () => {
    const pages = await custom.discoverPages()
    expect(Array.isArray(pages)).toBe(true)
  })

  it('walkDir picks up real .tsx page entries', async () => {
    const pages = await custom.discoverPages()
    expect(pages.some(p => p.filePath?.endsWith('page.tsx'))).toBe(true)
  })
})
