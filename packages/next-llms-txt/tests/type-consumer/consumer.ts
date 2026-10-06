/**
 * Type-level consumer of the PUBLISHED declarations (`dist/index.d.ts`).
 *
 * This file is never executed. CI compiles it with every supported TypeScript
 * version (5.9, 6.0, 7.0) to prove that the shipped `.d.ts` works for
 * consumers, independent of the TypeScript version the library is built with.
 * It resolves `next-llms-txt` to `dist/` via `paths`, so build the library
 * first.
 *
 * It deliberately uses plain type annotations instead of vitest's
 * `expectTypeOf`, so the check depends on nothing but `tsc`. The contract of
 * the source types is covered by `tests/unit/public-api-types.test.ts`.
 */
import type {
  AutoDiscoveryConfig,
  LLMsTxtConfig,
  LLMsTxtHandlerConfig,
  LLMsTxtItem,
  LLMsTxtPage,
  LLMsTxtSection,
  PageInfo,
} from 'next-llms-txt'
import type { NextRequest, NextResponse } from 'next/server'
import {
  createLLmsTxt,
  isLLMsTxtPath,
  LLMsTxtConfigError,
  LLMsTxtError,
  LLMsTxtGenerationError,
} from 'next-llms-txt'

type IsAny<T> = 0 extends 1 & T ? true : false

const item: LLMsTxtItem = { title: 'Docs', url: '/docs', description: 'Documentation' }
const section: LLMsTxtSection = { title: 'Guides', description: 'How-tos', items: [item] }

// Page-level export, as used by App Router and Pages Router pages.
export const llmstxt: LLMsTxtConfig = {
  title: 'Home',
  description: 'Landing page',
  sections: [section],
  optional: [item],
}

const page: LLMsTxtPage = { route: '/', config: llmstxt }

const autoDiscovery: AutoDiscoveryConfig = {
  appDir: 'src/app',
  pagesDir: 'src/pages',
  rootDir: '.',
  llmstxtExportName: 'llmstxt',
  extensions: ['.tsx', '.ts'],
}

const handlerConfig: LLMsTxtHandlerConfig = {
  baseUrl: 'https://example.com',
  defaultConfig: llmstxt,
  generator: (config, pages) => `${config.title}: ${pages?.length ?? 0}`,
  autoDiscovery,
  pages: [page],
  trailingSlash: false,
  showWarnings: true,
  cacheControl: false,
  onError: (error: unknown) => error,
  discoveryTimeoutMs: 1000,
}

const booleanAutoDiscovery: LLMsTxtHandlerConfig = { defaultConfig: llmstxt, autoDiscovery: true }

// Route handler export: `app/llms.txt/route.ts`.
export const { GET } = createLLmsTxt(handlerConfig)

// The published handler must keep Next's own request/response types. If the
// `next/server` import in the declarations stopped resolving they would
// silently degrade to `any`, and every assignment below would still compile.
const requestIsTyped: IsAny<Parameters<typeof GET>[0]> = false
const responseIsTyped: IsAny<Awaited<ReturnType<typeof GET>>> = false
const typedGet: (request: NextRequest) => Promise<NextResponse> = GET

// Proxy delegate: `proxy.ts`.
export async function proxy(request: NextRequest): Promise<NextResponse | undefined> {
  const matches: boolean = isLLMsTxtPath(request.nextUrl.pathname)
  return matches ? GET(request) : undefined
}

const pageInfo: PageInfo = {
  route: '/',
  filePath: 'src/app/page.tsx',
  hasLLMsTxtExport: true,
  hasMetadataFallback: false,
  config: llmstxt,
  warnings: [],
}

const baseError: Error = new LLMsTxtError('base', { cause: new Error('root cause') })
const configError: LLMsTxtError = new LLMsTxtConfigError('config')
const generationError: LLMsTxtError = new LLMsTxtGenerationError('generation')

export const exercised = [
  booleanAutoDiscovery,
  requestIsTyped,
  responseIsTyped,
  typedGet,
  pageInfo,
  baseError,
  configError,
  generationError,
]
