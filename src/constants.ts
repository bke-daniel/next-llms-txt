import type { RequiredLLMsTxtHandlerConfig } from './types'
import process from 'node:process'

// TODO Improve this to work in both CJS and ESM reliably
function getDirname(): string {
  if (process.env.PWD !== undefined)
    return process.env.PWD

  if (typeof __dirname !== 'undefined') {
    // CommonJS
    return __dirname
  }
  // else if (typeof import.meta?.dirname !== 'undefined') {
  //   return import.meta.dirname
  // }
  return '.'

  // __dirname
  //   ? path.join(__dirname, '..')
  //   : path.join(import.meta.dirname, '..'),
}

export const DEFAULT_CONFIG: RequiredLLMsTxtHandlerConfig = {
  baseUrl: `http://localhost:${process.env.PORT || 3000}`,
  defaultConfig: {
    title: 'My llms.txt Site',
    description: 'This is my llms.txt generated site.',
  },
  autoDiscovery: {
    appDir: 'src/app',
    // pagesDir: 'src/pages',
    rootDir: getDirname(),
  },
  // TODO get this from next.config.XX if possible
  trailingSlash: true,
  showWarnings: process.env.NODE_ENV === 'development',
}

export const PAGE_ERROR_NOTIFICATION = 'Page not found or no llms.txt configuration available.'
export const NO_EXPORTS_WARNING = '[next-llms-txt] No llms.txt export or metadata found - cannot generate llms.txt entry'
