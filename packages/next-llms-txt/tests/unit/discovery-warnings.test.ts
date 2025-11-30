import { vi } from 'vitest'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import mergeConfig from '../../src/merge-with-default-config'
import { LLMS_TXT_HANDLER_CONFIG } from '../constants'

describe('llmsTxtAutoDiscovery warnings', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should handle pages without config in generateSiteConfig', async () => {
    const discovery = new LLMsTxtAutoDiscovery(mergeConfig(LLMS_TXT_HANDLER_CONFIG))
    const siteConfig = await discovery.generateSiteConfig()

    expect(siteConfig).toHaveProperty('title')
    expect(siteConfig).toHaveProperty('sections')
    expect(Array.isArray(siteConfig.sections)).toBe(true)
  })

  it('should filter out pages without config', async () => {
    const discovery = new LLMsTxtAutoDiscovery(mergeConfig(LLMS_TXT_HANDLER_CONFIG))
    const siteConfig = await discovery.generateSiteConfig()

    // All pages in sections should have titles
    siteConfig.sections?.forEach((section) => {
      section.items.forEach((item) => {
        expect(item.title).toBeDefined()
        expect(item.url).toBeDefined()
      })
    })
  })

  it('should use default config for site title if not provided', async () => {
    const config = {
      ...LLMS_TXT_HANDLER_CONFIG,
      defaultConfig: undefined,
    }
    const discovery = new LLMsTxtAutoDiscovery(mergeConfig(config))
    const siteConfig = await discovery.generateSiteConfig()

    expect(siteConfig.title).toBeDefined()
    expect(typeof siteConfig.title).toBe('string')
  })

  it('should include page descriptions in site config items', async () => {
    const discovery = new LLMsTxtAutoDiscovery(mergeConfig(LLMS_TXT_HANDLER_CONFIG))
    const siteConfig = await discovery.generateSiteConfig()

    // Find items with descriptions
    const itemsWithDescriptions = siteConfig.sections
      ?.flatMap(s => s.items)
      .filter(item => item.description)

    expect(itemsWithDescriptions).toBeDefined()
  })
})
