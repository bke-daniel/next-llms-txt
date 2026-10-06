import type { RequiredLLMsTxtHandlerConfig } from './types'
import process from 'node:process'

export const DEFAULT_PAGE_EXTENSIONS = Object.freeze(['.ts', '.tsx', '.js', '.jsx'] as const)

export const DEFAULT_CONFIG: RequiredLLMsTxtHandlerConfig = {
  baseUrl: `http://localhost:${process.env.PORT || 3000}`,
  defaultConfig: {
    title: 'My llms.txt Site',
    description: 'This is my llms.txt generated site.',
    sections: [],
    optional: [],
  },
  // Frozen so that `autoDiscovery: true` (which returns this exact reference
  // from `mergeWithDefaultConfig`) can never be mutated by downstream code,
  // preventing ref-leaks between consecutive handler invocations.
  autoDiscovery: Object.freeze({
    appDir: 'src/app',
    pagesDir: 'src/pages',
    // Empty means "resolve against the live process.cwd() at discovery time".
    // Baking process.cwd() in here would freeze whatever directory was
    // current when this module first loaded, which is not necessarily the
    // Next.js project root.
    rootDir: '',
    llmstxtExportName: 'llmstxt',
    extensions: DEFAULT_PAGE_EXTENSIONS,
  }),
  trailingSlash: true,
  showWarnings: process.env.NODE_ENV === 'development',
}

export const PAGE_ERROR_NOTIFICATION = 'Page not found or no llms.txt configuration available.'
export const NO_EXPORTS_WARNING = '[next-llms-txt] No llms.txt export or metadata found - cannot generate llms.txt entry'
