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

// Auto-discovery class
// Types
// Markdown generator
// Core handler for manual config
// Enhanced handler for auto-discovery
// Per-page .html.md handler
export type {
  AutoDiscoveryConfig,
  LLMsTxtConfig,
  LLMsTxtHandlerConfig,
  LLMsTxtItem,
  LLMsTxtSection,
} from './types'
export { LLMsTxtAutoDiscovery } from './discovery'
export { generateLLMsTxt } from './generator'
export { createLLMsTxtHandlers, createEnhancedLLMsTxtHandlers, createPageLLMsTxtHandlers } from './handler'
export type { PageInfo } from './discovery'
