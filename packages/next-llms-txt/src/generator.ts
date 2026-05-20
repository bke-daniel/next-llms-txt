import type { LLMsTxtConfig, LLMsTxtItem, LLMsTxtPage } from './types.js'

/**
 * Generates llms.txt content following the llmstxt.org specification.
 *
 * Format:
 *   # Title (H1 - required)
 *   > Description (blockquote - optional)
 *
 *   ## Section (H2)
 *   - [Link Title](url): Description
 *
 *   ## Optional (special section for secondary information)
 *   - [Link Title](url): Description
 *
 * Output guarantees:
 * - Heading/description text is fully `trim()`-ed (was previously only
 *   `trimStart()`, which let trailing whitespace break ATX headings).
 * - Items missing a title are skipped rather than rendered as `[undefined]`.
 * - Output ends with a single trailing newline so concatenation tooling
 *   behaves and POSIX text-file convention is honoured.
 *
 * @param config - The llms.txt configuration
 * @param pages  - User-supplied pages emitted under `## Pages`
 * @returns Generated llms.txt content as markdown
 */
export function generateLLMsTxt(
  config: LLMsTxtConfig,
  pages: LLMsTxtPage[] = [],
): string {
  const header: string[] = [`# ${config.title.trim()}`]
  if (config.description)
    header.push(`> ${config.description.trim()}`)

  const contentBlocks: string[] = []

  // User-supplied pages → `## Pages` block. Discovered pages live in
  // `config.sections` after the site-handler's sectioning pass.
  if (pages.length > 0) {
    const pageItems = pages
      .filter(p => p.config && p.config.title)
      .map((page) => {
        const description = page.config?.description
          ? `: ${page.config.description.trim()}`
          : ''
        return `- [${page.config!.title.trim()}](${page.route})${description}`
      })
    if (pageItems.length > 0)
      contentBlocks.push(['## Pages', ...pageItems].join('\n'))
  }

  if (config.sections) {
    for (const section of config.sections) {
      const itemLines = section.items
        .filter((it: LLMsTxtItem) => Boolean(it && it.title))
        .map((item) => {
          const description = item.description ? `: ${item.description.trim()}` : ''
          return `- [${item.title.trim()}](${item.url})${description}`
        })
      // Skip section entirely when it has no renderable items.
      if (itemLines.length === 0)
        continue
      const block = [`## ${section.title.trim()}`]
      if (section.description)
        block.push(`> ${section.description.trim()}`)
      block.push(...itemLines)
      contentBlocks.push(block.join('\n'))
    }
  }

  if (config.optional && config.optional.length > 0) {
    const optionalLines = config.optional
      .filter(it => Boolean(it && it.title))
      .map((item) => {
        const description = item.description ? `: ${item.description.trim()}` : ''
        return `- [${item.title.trim()}](${item.url})${description}`
      })
    if (optionalLines.length > 0)
      contentBlocks.push(['## Optional', ...optionalLines].join('\n'))
  }

  return `${[header.join('\n'), ...contentBlocks].filter(Boolean).join('\n\n')}\n`
}
