import type { NextRequest } from 'next/server'
import type { AutoDiscoveryConfig } from './discovery'
import type { LLMsTxtConfig, LLMsTxtHandlerConfig } from './types'
import { NextResponse } from 'next/server'
import { LLMsTxtAutoDiscovery } from './discovery'
import { generateLLMsTxt } from './generator'

/**
 * Enhanced handler configuration with auto-discovery support
 */
export interface EnhancedHandlerConfig extends LLMsTxtHandlerConfig {
  /**
   * Enable automatic page discovery
   */
  autoDiscovery?: boolean | AutoDiscoveryConfig

  /**
   * Support trailing slash variations
   */
  trailingSlash?: boolean
}

/**
 * Creates enhanced handlers with automatic page discovery support
 */
export function createEnhancedLLMsTxtHandlers(
  config: LLMsTxtConfig | EnhancedHandlerConfig,
): {
  GET: (request: NextRequest) => Promise<NextResponse>
} {
  let llmsConfig: LLMsTxtConfig | undefined
  let handlerConfig: EnhancedHandlerConfig | undefined

  if ('defaultConfig' in config) {
    handlerConfig = config as EnhancedHandlerConfig
    llmsConfig = handlerConfig.defaultConfig
  }
  else {
    llmsConfig = config as LLMsTxtConfig
  }

  const GET = async (_request: NextRequest): Promise<NextResponse> => {
    try {
      let finalConfig = llmsConfig

      // Handle auto-discovery if enabled
      if (handlerConfig?.autoDiscovery) {
        const discoveryConfig = typeof handlerConfig.autoDiscovery === 'object'
          ? handlerConfig.autoDiscovery
          : { baseUrl: 'https://www.next-llms-txt.com' }

        const discovery = new LLMsTxtAutoDiscovery(discoveryConfig)
        const discoveredConfig = await discovery.generateSiteConfig()

        // Merge discovered config with provided config
        finalConfig = {
          ...discoveredConfig,
          ...finalConfig, // User-provided config takes priority for title/description
          // Always use discovered sections since that's the point of auto-discovery
          sections: discoveredConfig.sections || [],
        }
      }

      if (!finalConfig?.title) {
        throw new Error('LLMs.txt configuration must have a title')
      }

      // Use custom generator if provided, otherwise use default
      const content = handlerConfig?.generator
        ? handlerConfig.generator(finalConfig)
        : generateLLMsTxt(finalConfig)

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
 * Creates handlers for individual page routes with .html.md support
 */
export function createPageLLMsTxtHandlers(
  baseUrl: string,
  config?: EnhancedHandlerConfig,
): {
  GET: (request: NextRequest) => Promise<NextResponse>
} {
  const GET = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const url = new URL(request.url)
      let pathname = url.pathname

      // Handle .html.md extension
      if (pathname.endsWith('.html.md')) {
        pathname = pathname.slice(0, -3)
      }

      // Handle index.html
      if (pathname.endsWith('/index.html')) {
        pathname = pathname.slice(0, -10) || '/'
      }

      // Support trailing slash variations
      if (config?.trailingSlash !== false) {
        pathname = pathname.replace(/\/$/, '') || '/'
      }

      // Auto-discover page configuration
      const discoveryConfig: AutoDiscoveryConfig = {
        baseUrl,
        ...(typeof config?.autoDiscovery === 'object' ? config.autoDiscovery : {}),
      }

      const discovery = new LLMsTxtAutoDiscovery(discoveryConfig)
      const pages = await discovery.discoverPages()

      // Find matching page
      const matchingPage = pages.find((page) => {
        // Normalize the discovered page route by removing the .html extension.
        // e.g., '/services/no-export.html' becomes '/services/no-export'
        const normalizedPageRoute = page.route.endsWith('.html')
          ? page.route.slice(0, -5)
          : page.route

        // Normalize the incoming request pathname by removing trailing slashes and the .html extension.
        // e.g., '/services/no-export/' becomes '/services/no-export'
        // e.g., '/services/no-export.html' becomes '/services/no-export'
        let normalizedPathname = pathname
        if (normalizedPathname.length > 1 && normalizedPathname.endsWith('/')) {
          normalizedPathname = normalizedPathname.slice(0, -1)
        }
        if (normalizedPathname.endsWith('.html')) {
          normalizedPathname = normalizedPathname.slice(0, -5)
        }

        // Compare the normalized paths.
        return normalizedPageRoute === normalizedPathname
      })

      if (!matchingPage?.config) {
        return new NextResponse('Page not found or no llms.txt configuration available', {
          status: 404,
        })
      }

      // Generate single-page llms.txt
      const pageConfig: LLMsTxtConfig = {
        ...matchingPage.config,
        sections: [
          {
            title: 'This Page',
            items: [{
              title: matchingPage.config.title,
              url: `${baseUrl}${pathname}`,
              description: matchingPage.config.description,
            }],
          },
        ],
      }

      const content = config?.generator
        ? config.generator(pageConfig)
        : generateLLMsTxt(pageConfig)

      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }
    catch (error) {
      console.error('Error generating page llms.txt:', error)
      return new NextResponse('Error generating llms.txt', { status: 500 })
    }
  }

  return { GET }
}
