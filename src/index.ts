/**
 * next-llms-txt - A Next.js plugin for generating llms.txt files
 *
 * This package helps you generate llms.txt files following the llmstxt.org specification.
 * It provides a middleware-first approach for intercepting /llms.txt and /*.html.md requests,
 * with support for automatic page discovery and comprehensive site-wide llms.txt generation.
 *
 * @example
 * ```typescript
 * // src/middleware.ts
 * import { createLLmsTxt } from 'next-llms-txt';
 *
 * const { GET: handleLLmsTxt } = createLLmsTxt({
 *   autoDiscovery: {
 *     baseUrl: process.env.VERCEL_URL || 'http://localhost:3000',
 *   },
 * });
 *
 * export async function middleware(request: NextRequest) {
 *   const { pathname } = request.nextUrl;
 *   if (pathname === '/llms.txt' || pathname.endsWith('.html.md')) {
 *     return await handleLLmsTxt(request);
 *   }
 *   return NextResponse.next();
 * }
 * ```
 */

export { LLMsTxtAutoDiscovery } from './discovery.js'
export type { PageInfo } from './discovery.js'
export { generateLLMsTxt } from './generator.js'
export { createLLmsTxt } from './handler.js'

export type {
  AutoDiscoveryConfig,
  LLMsTxtConfig,
  LLMsTxtHandlerConfig,
  LLMsTxtItem,
  LLMsTxtSection,
} from './types.js'
