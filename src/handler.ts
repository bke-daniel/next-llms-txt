import type { NextRequest } from 'next/server'
import type { LLMsTxtConfig, LLMsTxtHandlerConfig } from './types'
import { NextResponse } from 'next/server'
import { generateLLMsTxt } from './generator'

/**
 * Creates handlers for the llms.txt API route
 * Following the Auth.js pattern where handlers are exported and can be re-exported in route files
 *
 * Usage:
 * ```typescript
 * // lib/llmstxt.ts
 * import { createLLMsTxtHandlers } from 'next-llms-txt';
 *
 * export const { GET } = createLLMsTxtHandlers({
 *   title: "My Project",
 *   description: "A brief summary",
 *   sections: [...]
 * });
 *
 * // app/llms.txt/route.ts
 * import { GET } from "@/lib/llmstxt"
 * export { GET }
 * ```
 *
 * @param config - The llms.txt configuration or handler config
 * @returns Object with GET handler
 */
export function createLLMsTxtHandlers(
  config: LLMsTxtConfig | LLMsTxtHandlerConfig,
): {
  GET: (request: NextRequest) => Promise<NextResponse>
} {
  // Check if it's a handler config or direct llms.txt config
  let llmsConfig: LLMsTxtConfig
  let handlerConfig: LLMsTxtHandlerConfig | undefined

  if ('defaultConfig' in config) {
    // It's a LLMsTxtHandlerConfig
    if (!config.defaultConfig) {
      throw new Error('LLMs.txt configuration is required in defaultConfig')
    }
    llmsConfig = config.defaultConfig
    handlerConfig = config
  }
  else {
    // It's a direct LLMsTxtConfig
    llmsConfig = config as LLMsTxtConfig
    handlerConfig = undefined
  }

  if (!llmsConfig.title) {
    throw new Error('LLMs.txt configuration must have a title')
  }

  const GET = async (_request: NextRequest) => {
    try {
      // Use custom generator if provided, otherwise use default
      const content = handlerConfig?.generator
        ? handlerConfig.generator(llmsConfig)
        : generateLLMsTxt(llmsConfig)

      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    catch (error) {
      console.error('Error generating llms.txt:', error)
      return new NextResponse('Error generating llms.txt', { status: 500 })
    }
  }

  return { GET }
}

/**
 * Convenience export that matches the Auth.js pattern name
 */
export const handlers = createLLMsTxtHandlers
