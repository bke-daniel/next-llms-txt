import type { PageInfo } from '../../src/discovery'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import {
  ALL_ROUTES,
  APP_DIR_FULL_PATH,
  LLMS_TXT_HANDLER_CONFIG,
} from '../constants.js'

const configCases = [
  { title: 'Test with manual config', config: LLMS_TXT_HANDLER_CONFIG },
  { title: 'Test with auto discovery configured manually', config: { ...LLMS_TXT_HANDLER_CONFIG, autoDiscovery: true } },
]

describe('discovery: discoverAppPages', () => {
  describe.each(configCases)('$title', ({ config }) => {
    const discovery = new LLMsTxtAutoDiscovery(config)
    let appPages: PageInfo[] = []
    beforeAll(async () => {
      // @ts-expect-error access to protected method for testing
      appPages = await discovery.discoverAppPages(APP_DIR_FULL_PATH)
    })

    it('should generate all page entries as expected', async () => {
      expect(appPages.length).toBe(ALL_ROUTES.length)
    })

    it('should generate /all-exports', async () => {
      const allExportsPageInfo = appPages.find(p => p.route === '/all-exports')
      expect(allExportsPageInfo).toBeDefined()
      expect(allExportsPageInfo?.hasLLMsTxtExport).toBe(true)
      // expect(allExportsPageInfo?.hasMetadataFallback).toBe(true)
    })
  })
})
