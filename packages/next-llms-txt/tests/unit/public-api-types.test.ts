import type {
  AutoDiscoveryConfig,
  LLMsTxtConfig,
  LLMsTxtConfigError,
  LLMsTxtError,
  LLMsTxtGenerationError,
  LLMsTxtHandlerConfig,
  LLMsTxtItem,

  LLMsTxtPage,
  LLMsTxtSection,
  PageInfo,
} from '../../src'
import { expectTypeOf, it } from 'vitest'
import {
  createLLmsTxt,
  isLLMsTxtPath,
} from '../../src'

/**
 * Type-only tests for the public API surface — these don't *run*, but they
 * fail the build whenever the type contract drifts. Covers the audit item
 * P3 #48 (no `expectTypeOf`/`tsd` coverage on the public types).
 */
describe('public type surface contract', () => {
  it('requires LLMsTxtConfig.title and keeps the rest optional', () => {
    expectTypeOf<LLMsTxtConfig>().toHaveProperty('title').toEqualTypeOf<string>()
    expectTypeOf<LLMsTxtConfig['description']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<LLMsTxtConfig['sections']>().toEqualTypeOf<LLMsTxtSection[] | undefined>()
    expectTypeOf<LLMsTxtConfig['optional']>().toEqualTypeOf<LLMsTxtItem[] | undefined>()
  })

  it('keeps LLMsTxtSection.items required even though title/description vary', () => {
    expectTypeOf<LLMsTxtSection>().toHaveProperty('title').toEqualTypeOf<string>()
    expectTypeOf<LLMsTxtSection>().toHaveProperty('items').toEqualTypeOf<LLMsTxtItem[]>()
    expectTypeOf<LLMsTxtSection['description']>().toEqualTypeOf<string | undefined>()
  })

  it('requires LLMsTxtItem.title and url, description optional', () => {
    expectTypeOf<LLMsTxtItem>().toHaveProperty('title').toEqualTypeOf<string>()
    expectTypeOf<LLMsTxtItem>().toHaveProperty('url').toEqualTypeOf<string>()
    expectTypeOf<LLMsTxtItem['description']>().toEqualTypeOf<string | undefined>()
  })

  it('keeps LLMsTxtPage as a public, lean shape (route required, config optional)', () => {
    expectTypeOf<LLMsTxtPage>().toHaveProperty('route').toEqualTypeOf<string>()
    expectTypeOf<LLMsTxtPage['config']>().toEqualTypeOf<LLMsTxtConfig | undefined>()
    // The internal PageInfo has more fields; LLMsTxtPage stays minimal.
    expectTypeOf<LLMsTxtPage>().not.toHaveProperty('filePath')
    expectTypeOf<LLMsTxtPage>().not.toHaveProperty('hasLLMsTxtExport')
    expectTypeOf<LLMsTxtPage>().not.toHaveProperty('hasMetadataFallback')
    expectTypeOf<LLMsTxtPage>().not.toHaveProperty('warnings')
  })

  it('accepts a boolean OR an AutoDiscoveryConfig on LLMsTxtHandlerConfig.autoDiscovery', () => {
    expectTypeOf<LLMsTxtHandlerConfig['autoDiscovery']>()
      .toEqualTypeOf<AutoDiscoveryConfig | boolean | undefined>()
  })

  it('types LLMsTxtHandlerConfig.pages as LLMsTxtPage[] (not internal PageInfo[])', () => {
    expectTypeOf<LLMsTxtHandlerConfig['pages']>()
      .toEqualTypeOf<LLMsTxtPage[] | undefined>()
  })

  it('cacheControl accepts string, false, or undefined', () => {
    expectTypeOf<LLMsTxtHandlerConfig['cacheControl']>()
      .toEqualTypeOf<string | false | undefined>()
  })

  it('onError accepts an unknown payload', () => {
    expectTypeOf<NonNullable<LLMsTxtHandlerConfig['onError']>>()
      .parameter(0)
      .toEqualTypeOf<unknown>()
  })

  it('createLLmsTxt returns { GET } with the expected signature', () => {
    const handler = createLLmsTxt({
      baseUrl: 'http://example.com',
      defaultConfig: { title: 'X' },
      autoDiscovery: false,
    })
    expectTypeOf(handler).toHaveProperty('GET').toBeFunction()
  })

  it('isLLMsTxtPath returns boolean', () => {
    expectTypeOf(isLLMsTxtPath).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(isLLMsTxtPath).returns.toEqualTypeOf<boolean>()
  })

  it('error class hierarchy is exported and extends Error', () => {
    expectTypeOf<LLMsTxtError>().toMatchTypeOf<Error>()
    expectTypeOf<LLMsTxtConfigError>().toMatchTypeOf<LLMsTxtError>()
    expectTypeOf<LLMsTxtGenerationError>().toMatchTypeOf<LLMsTxtError>()
  })

  it('exports PageInfo with the internal discovery shape (for advanced consumers)', () => {
    expectTypeOf<PageInfo>().toHaveProperty('route').toEqualTypeOf<string>()
    expectTypeOf<PageInfo['config']>().toEqualTypeOf<LLMsTxtConfig | undefined>()
  })
})
