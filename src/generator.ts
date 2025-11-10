import type { LLMsTxtConfig, PageInfo } from './types'

/**
 * Generates llms.txt content following the llmstxt.org specification
 *
 * Format:
 * # Title (H1 - required)
 * > Description (blockquote - optional)
 *
 * ## Section (H2)
 * - [Link Title](url): Description
 *
 * ## Optional (special section for secondary information)
 * - [Link Title](url): Description
 *
 * @param config - The llms.txt configuration
 * @returns The generated llms.txt content as markdown
 */
export function generateLLMsTxt(
  config: LLMsTxtConfig,
  pages: PageInfo[] = [],
): string {
  const header = [`# ${config.title}`]
  if (config.description) {
    header.push(`> ${config.description}`)
  }

  const contentBlocks: string[] = []

  // Pages from auto-discovery
  if (pages.length > 0) {
    const block = ['## Pages']
    pages.forEach((page) => {
      const description = page.config?.description
        ? `: ${page.config.description}`
        : ''
      block.push(`- [${page.config?.title}](${page.route})${description}`)
    })
    contentBlocks.push(block.join('\n'))
  }

  // Manually configured pages/items in sections
  if (config.sections) {
    config.sections.forEach((section) => {
      const block = [`## ${section.title}`]
      if (section.description) {
        block.push(`> ${section.description}`)
      }
      if (section.items.length > 0) {
        section.items.forEach((item) => {
          const description = item.description ? `: ${item.description}` : ''
          block.push(`- [${item.title}](${item.url})${description}`)
        })
      }
      contentBlocks.push(block.join('\n'))
    })
  }

  // Optional section
  if (config.optional && config.optional.length > 0) {
    const block = ['## Optional']
    config.optional.forEach((item) => {
      const description = item.description ? `: ${item.description}` : ''
      block.push(`- [${item.title}](${item.url})${description}`)
    })
    contentBlocks.push(block.join('\n'))
  }

  return [header.join('\n'), ...contentBlocks].filter(Boolean).join('\n\n')
}
