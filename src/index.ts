/**
 * next-llms-txt - A Next.js 16+ plugin for generating llms.txt files
 *
 * This package helps you generate llms.txt files following the llmstxt.org specification.
 * It provides a proxy-first approach for intercepting /llms.txt and /*.html.md requests,
 * with support for automatic page discovery and comprehensive site-wide llms.txt generation.
 *
 * @example
 * ```typescript
 * // src/proxy.ts
 * import { createLLmsTxt, isLLMsTxtPath } from 'next-llms-txt';
 *
 * const { GET: handleLLmsTxt } = createLLmsTxt({
 *   autoDiscovery: {
 *     baseUrl: process.env.VERCEL_URL || 'http://localhost:3000',
 *   },
 * });
 *
 * export default async function proxy(request: NextRequest) {
 *   const { pathname } = request.nextUrl;
 *   if (isLLMsTxtPath(pathname)) {
 *     return await handleLLmsTxt(request);
 *   }
 *   return NextResponse.next();
 * }
 * ```
 */

// export { LLMsTxtAutoDiscovery } from './discovery.js'
export type { PageInfo } from './discovery.js'
// export { generateLLMsTxt } from './generator.js'
export { createLLmsTxt } from './handler.js'
export { isLLMsTxtPath } from './llms-txt-matcher.js'

export type {
  AutoDiscoveryConfig,
  LLMsTxtConfig,
  LLMsTxtHandlerConfig,
  LLMsTxtItem,
  LLMsTxtSection,
} from './types.js'
