import { vi } from 'vitest'
import { DEFAULT_CONFIG } from '../../src/constants'
import mergeWithDefaultConfig from '../../src/merge-with-default-config'

describe('test mergeWithDefaultConfig', () => {
  it('returns default config when input is empty object', () => {
    const result = mergeWithDefaultConfig({} as any)
    expect(result).toEqual(expect.objectContaining({
      ...DEFAULT_CONFIG,
    }))
  })

  it('merges baseUrl and deep-merges defaultConfig with the defaults', () => {
    const input = {
      baseUrl: 'https://example.com',
      defaultConfig: {
        title: 'Custom Title',
        description: 'Custom Desc',
      },
    }
    const result = mergeWithDefaultConfig(input)
    expect(result.baseUrl).toBe('https://example.com')
    // Deep-merge: user overrides win where supplied, defaults fill the rest.
    expect(result.defaultConfig).toEqual({
      title: 'Custom Title',
      description: 'Custom Desc',
      sections: [],
      optional: [],
    })
  })

  it('deep merges autoDiscovery object', () => {
    const input = {
      autoDiscovery: {
        appDir: 'custom/app',
        rootDir: '/custom/root',
      },
    }
    const result = mergeWithDefaultConfig(input)
    expect(result.autoDiscovery.appDir).toBe('custom/app')
    expect(result.autoDiscovery.rootDir).toBe('/custom/root')
  })

  it('uses default autoDiscovery if input is boolean true', () => {
    const input = {
      autoDiscovery: true,
    }
    const result = mergeWithDefaultConfig(input)
    expect(result.autoDiscovery).toEqual(DEFAULT_CONFIG.autoDiscovery)
  })

  it('preserves autoDiscovery:false to actually disable discovery', () => {
    const input = {
      autoDiscovery: false as const,
    }
    const result = mergeWithDefaultConfig(input)
    expect(result.autoDiscovery).toBe(false)
  })

  it('merges trailingSlash and showWarnings', () => {
    const input = {
      trailingSlash: false,
      showWarnings: true,
    }
    const result = mergeWithDefaultConfig(input)
    expect(result.trailingSlash).toBe(false)
    expect(result.showWarnings).toBe(true)
  })

  it('preserves generator function', () => {
    const generator = vi.fn()
    const input = {
      generator,
    }
    const result = mergeWithDefaultConfig(input)
    expect(result.generator).toBe(generator)
  })

  it('handles missing autoDiscovery key', () => {
    const input = {
      baseUrl: 'https://missing.com',
    }
    const result = mergeWithDefaultConfig(input)
    expect(result.autoDiscovery).toEqual(DEFAULT_CONFIG.autoDiscovery)
  })

  it('handles undefined input', () => {
    const result = mergeWithDefaultConfig(undefined as any)
    expect(result).toEqual(expect.objectContaining(DEFAULT_CONFIG))
  })
})
