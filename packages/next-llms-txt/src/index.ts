/**
 * next-llms-txt - A Next.js 16+ plugin for generating llms.txt files
 *
 * Generates llms.txt files following the llmstxt.org specification by
 * intercepting `/llms.txt` and `/*.html.md` requests in Next 16+ Routing
 * Middleware (`proxy.ts`). `baseUrl` lives at the top of the config — not
 * inside `autoDiscovery`.
 *
 * @example
 * ```typescript
 * // src/proxy.ts
 * import { createLLmsTxt, isLLMsTxtPath } from 'next-llms-txt';
 *
 * const { GET: handleLLmsTxt } = createLLmsTxt({
 *   baseUrl: process.env.VERCEL_URL || 'http://localhost:3000',
 *   defaultConfig: { title: 'My Site' },
 *   autoDiscovery: true,
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

export type { PageInfo } from './discovery.js'
export {
  LLMsTxtConfigError,
  LLMsTxtError,
  LLMsTxtGenerationError,
} from './errors.js'
export { createLLmsTxt } from './handler.js'
export { isLLMsTxtPath } from './llms-txt-matcher.js'

export type {
  AutoDiscoveryConfig,
  LLMsTxtConfig,
  LLMsTxtHandlerConfig,
  LLMsTxtItem,
  LLMsTxtSection,
} from './types.js'
