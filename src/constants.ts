import process
  from 'node:process'

export const DEFAULT_CONFIG = {
  baseUrl: `http://localhost:${process.env.PORT || 3000}`,
  defaultConfig: {
    title: 'My llms.txt Site',
    description: 'This is my llms.txt generated site.',
  },
  autoDiscovery: {
    appDir: 'src/app',
    pagesDir: 'src/pages',
    rootDir: process.env.PWD,
  },
  // TODO get this from next.config.XX if possible
  trailingSlash: true,
  showWarnings: process.env.NODE_ENV === 'development',
}

export const PAGE_ERROR_NOTIFICATION = 'Page not found or no llms.txt configuration available.'
export const NO_EXPORTS_WARNING = '[next-llms-txt] No llms.txt export or metadata found - cannot generate llms.txt entry'
