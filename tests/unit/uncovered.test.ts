import path from 'node:path'
import { LLMsTxtAutoDiscovery } from '../../src/discovery'
import { getAutoDiscoveryConfig, normalizePath } from '../../src/handler'

describe('uncovered logic tests', () => {
  it('merges config in constructor', () => {
    const custom = new LLMsTxtAutoDiscovery({ appDir: 'custom-app', pagesDir: 'custom-pages', rootDir: '/tmp', showWarnings: true, baseUrl: 'http://localhost' })
    expect(custom.config.appDir).toBe('custom-app')
    expect(custom.config.pagesDir).toBe('custom-pages')
    expect(custom.config.rootDir).toBe('/tmp')
    expect(custom.config.showWarnings).toBe(true)
  })

  it('discovers pages from pagesDir', async () => {
    const auto = new LLMsTxtAutoDiscovery({ rootDir: path.resolve(__dirname, '../fixtures/test-project'), appDir: 'src/app', pagesDir: 'src/pages', baseUrl: 'http://localhost' })
    const pages = await auto.discoverPages()
    expect(Array.isArray(pages)).toBe(true)
  })

  it('groups pages in generateSiteConfig', async () => {
    const auto = new LLMsTxtAutoDiscovery({ rootDir: path.resolve(__dirname, '../fixtures/test-project'), appDir: 'src/app', pagesDir: 'src/pages', baseUrl: 'http://localhost:3000' })
    const config = await auto.generateSiteConfig()
    expect(config).toHaveProperty('sections')
    const sectionTitles = config.sections.map((s: any) => s.title)
    expect(sectionTitles).toContain('Main Pages')
    expect(sectionTitles).toContain('Services')
  })

  it('walkDir discovers .tsx files', async () => {
    const auto = new LLMsTxtAutoDiscovery({ rootDir: path.resolve(__dirname, '../fixtures/test-project'), appDir: 'src/app', pagesDir: 'src/pages', baseUrl: 'http://localhost' })
    // walkDir is private, but discoverPages uses it internally
    const pages = await auto.discoverPages()
    expect(pages.some(p => p.filePath.endsWith('page.tsx'))).toBe(true)
  })

  it('getAutoDiscoveryConfig throws if baseUrl missing', () => {
    expect(() => getAutoDiscoveryConfig({} as any)).toThrow(/baseUrl/)
  })

  it('normalizePath handles /index and trailing slash', () => {
    expect(normalizePath('/foo/index')).toBe('/foo')
    expect(normalizePath('/foo/')).toBe('/foo')
    expect(normalizePath('/')).toBe('/')
  })
})
