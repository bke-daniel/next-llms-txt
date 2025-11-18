import type { AutoDiscoveryConfig, LLMsTxtConfig, LLMsTxtHandlerConfig } from '../src/types.js'
import path from 'node:path'
import { createLLmsTxt } from '../src/handler.js'

export const LLMSTXT = Object.freeze<LLMsTxtConfig>({
  title: 'This is the llmstxt export',
  description: 'Is used for generation when it exists.',
})

export const METADATA = Object.freeze({
  title: 'This is the metadata export',
  description: 'This shouldn\'t be used for generation when llmstxt export exist!',
})

export const BASE_URL = 'http://localhost:3000'
/**
 * Routes for testing which reflect next js urls like '/all-exports'
 */
export const routes = ['/', '/all-exports', '/metadata-only', '/llms-txt-only', '/no-exports', '/full-test']
  .sort()
/**
 * Nested routes for testing which reflect next js urls like '/nested/all-exports'
 */
export const nestedRoutes = routes
  .map(p => `/nested${p}`)
  // full-test page doesn't exist in nested folder
  .filter(r => r.includes('full') ? false : r !== '/nested/')
  .filter(Boolean)
  .sort()

export const ALL_ROUTES = Object.freeze([...routes, ...nestedRoutes].sort())
export const ROUTES_WITH_EXPORTS = Object.freeze(
  [...routes, ...nestedRoutes]
    .filter(r => r !== '/no-exports' && r !== '/nested/no-exports')
    .sort(),
)
export const ROUTES_WITH_NO_EXPORT = Object.freeze(
  ['/no-exports', '/nested/no-exports']
    .sort(),
)

export const ROOT_DIR = path.resolve(__dirname, './fixtures/nextjs')
export const APP_DIR = '/app'
export const APP_DIR_FULL_PATH = path.join(ROOT_DIR, APP_DIR)
export const AUTO_DISCOVERY = Object.freeze<AutoDiscoveryConfig>({
  rootDir: ROOT_DIR,
  appDir: APP_DIR,
})

export const DEFAULT_CONFIG = Object.freeze<LLMsTxtHandlerConfig['defaultConfig']>({
  title: 'Test Site',
  description: 'Test description',
})

export const LLMS_TXT_HANDLER_CONFIG = Object.freeze<LLMsTxtHandlerConfig>({
  baseUrl: BASE_URL,
  defaultConfig: DEFAULT_CONFIG,
  autoDiscovery: AUTO_DISCOVERY,
})

export const LLMS_TXT_HANDLER = createLLmsTxt(LLMS_TXT_HANDLER_CONFIG)

export const FULL_LLMS_TXT_CONFIG: LLMsTxtConfig = {
  title: 'Test LLMs.txt',
  description: 'This is a test llms.txt file',
  sections: [
    {
      title: 'Main Section',
      description: 'This is the main section',
      items: [
        {
          title: 'Item One',
          url: '/item-one',
          description: 'Description for item one',
        },
        {
          title: 'Item Two',
          url: '/item-two',
        },
      ],
    },
  ],
  optional: [
    {
      title: 'Optional Item',
      url: '/optional-item',
      description: 'This is an optional item',
    },
  ],
}
