import type { LLMsTxtConfig } from '../src/types'

/**
 * Test utility functions and common configurations
 */

export const testConfigs = {
  minimal: (): LLMsTxtConfig => ({
    title: 'Test Project',
  }),

  withDescription: (): LLMsTxtConfig => ({
    title: 'Test Project',
    description: 'A test project for demonstration',
  }),

  withSections: (): LLMsTxtConfig => ({
    title: 'Multi-Section Project',
    description: 'Testing multiple sections',
    sections: [
      {
        title: 'Documentation',
        items: [
          {
            title: 'Getting Started',
            url: '/docs/getting-started',
            description: 'Learn the basics',
          },
          {
            title: 'API Reference',
            url: '/docs/api',
          },
        ],
      },
      {
        title: 'Examples',
        items: [
          {
            title: 'Basic Example',
            url: '/examples/basic',
            description: 'Simple usage example',
          },
        ],
      },
    ],
  }),

  large: (sections = 10, itemsPerSection = 5): LLMsTxtConfig => ({
    title: 'Large Configuration Test',
    description: `Testing with ${sections} sections and ${itemsPerSection} items each`,
    sections: Array.from({ length: sections }, (_, i) => ({
      title: `Section ${i + 1}`,
      items: Array.from({ length: itemsPerSection }, (_, j) => ({
        title: `Item ${j + 1} in Section ${i + 1}`,
        url: `/section-${i + 1}/item-${j + 1}`,
        description: `Description for item ${j + 1} in section ${i + 1}`,
      })),
    })),
  }),
}

/**
 * Validates that content follows llmstxt.org specification
 */
export function validateLLMsTxtFormat(content: string): boolean {
  const lines = content.split('\n').filter(line => line.length > 0)

  if (lines.length === 0)
    return false

  // First line must be H1 title
  if (!lines[0].match(/^# .+/))
    return false

  // Check for valid structure
  for (const line of lines) {
    // Only allow H1 titles, H2 sections, blockquotes, and markdown lists
    if (!line.match(/^(# |## |> |- \[.+\]\(.+\)(?:: .+)?$)/)) {
      return false
    }
  }

  return true
}

/**
 * Mock NextRequest for testing
 */
export function createMockRequest(url = 'http://localhost:3000/llms.txt'): any {
  return {
    url,
    method: 'GET',
    headers: new Map(),
  }
}

/**
 * Extracts sections from generated content for testing
 */
export function extractSections(content: string): { title: string, items: string[] }[] {
  const lines = content.split('\n')
  const sections: { title: string, items: string[] }[] = []
  let currentSection: { title: string, items: string[] } | null = null

  for (const line of lines) {
    if (line.match(/^## .+/)) {
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        title: line.substring(3),
        items: [],
      }
    }
    else if (line.match(/^- \[.+\]/)) {
      if (currentSection) {
        currentSection.items.push(line)
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection)
  }

  return sections
}
