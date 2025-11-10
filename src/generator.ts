import type { LLMsTxtConfig } from './types'

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
export function generateLLMsTxt(config: LLMsTxtConfig): string {
  const lines: string[] = []

  // H1 header (required)
  lines.push(`# ${config.title}`)
  lines.push('')

  // Blockquote description (optional)
  if (config.description) {
    lines.push(`> ${config.description}`)
    lines.push('')
  }

  // Sections (H2 headers with markdown lists)
  if (config.sections && config.sections.length > 0) {
    for (const section of config.sections) {
      lines.push(`## ${section.title}`)

      for (const item of section.items) {
        const description = item.description ? `: ${item.description}` : ''
        lines.push(`- [${item.title}](${item.url})${description}`)
      }

      lines.push('')
    }
  }

  // Optional section (special meaning - can be skipped for shorter context)
  if (config.optional && config.optional.length > 0) {
    lines.push('## Optional')

    for (const item of config.optional) {
      const description = item.description ? `: ${item.description}` : ''
      lines.push(`- [${item.title}](${item.url})${description}`)
    }

    lines.push('')
  }

  return `${lines.join('\n').trim()}\n`
}
