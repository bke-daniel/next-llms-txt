import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import {
  APP_DIR_FULL_PATH,
  LLMS_TXT_HANDLER_CONFIG,
} from '../constants.js'

describe('discovery: discoverAppPages', () => {
  const discovery = new LLMsTxtAutoDiscovery(LLMS_TXT_HANDLER_CONFIG)

  it('should extract config from \'/all-exports\' properly', async () => {
    // @ts-expect-error access to protected method for testing
    const res = await discovery.analyzePage(
      `${APP_DIR_FULL_PATH}/all-exports/page.tsx`,
      '/all-exports',
    )

    expect(res).toBeDefined()
    expect(res.filePath).toBe(`${APP_DIR_FULL_PATH}/all-exports/page.tsx`)
    expect(res.hasLLMsTxtExport).toBe(true)
  })
})
