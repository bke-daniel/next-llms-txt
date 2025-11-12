import type { LLMsTxtConfig, LLMsTxtHandlerConfig } from '../../src/types'

export const llmstxt: LLMsTxtConfig = {
  title: 'This is the llmstxt export',
  description: 'This should be used for generation',
}

export const metadata = {
  title: 'This is the metadata export',
  description: 'This shouldn\'t be used for generation!',
}

/**
 * Routes for testing which reflect next js urls like '/all-exports'
 */
export const routes = ['/all-exports', '/metadata-only', '/no-exports']
/**
 * Nested routes for testing which reflect next js urls like '/nested/all-exports'
 */
export const nestedRoutes = routes.map(p => `/nested${p}`)

export const autoDiscovery: LLMsTxtHandlerConfig['autoDiscovery'] = {
  baseUrl: 'http://localhost:3000',
  appDir: './tests/fixtures/test-project/src/app',
}

export const defaultConfig: LLMsTxtHandlerConfig['defaultConfig'] = {
  title: 'Test Site',
  description: 'Test description',
}

export const llmsTxtConfig: LLMsTxtHandlerConfig = {
  defaultConfig,
  autoDiscovery,
}
