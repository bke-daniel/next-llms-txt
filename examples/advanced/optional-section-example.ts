import type { LLMsTxtConfig } from '../../src/types'
import { generateLLMsTxt } from '../../src/generator'

/**
 * Example demonstrating the Optional section feature
 * According to llmstxt.org specification, the Optional section contains
 * secondary information that can be skipped for shorter context
 */

const configWithOptional: LLMsTxtConfig = {
  title: 'FastHTML Project',
  description: 'FastHTML is a python library which brings together Starlette, Uvicorn, HTMX, and fastcore\'s FT "FastTags" into a library for creating server-rendered hypermedia applications.',
  sections: [
    {
      title: 'Documentation',
      items: [
        {
          title: 'FastHTML quick start',
          url: '/docs/tutorials/quickstart_for_web_devs.html.md',
          description: 'A brief overview of many FastHTML features',
        },
        {
          title: 'Core concepts',
          url: '/docs/core-concepts.html.md',
          description: 'Understanding the fundamentals',
        },
      ],
    },
    {
      title: 'Examples',
      items: [
        {
          title: 'Todo list application',
          url: '/examples/adv_app.py',
          description: 'Detailed walk-thru of a complete CRUD app in FastHTML showing idiomatic use of FastHTML and HTMX patterns',
        },
      ],
    },
  ],
  // Optional section - secondary information that can be skipped for shorter context
  optional: [
    {
      title: 'Starlette full documentation',
      url: 'https://gist.githubusercontent.com/jph00/809e4a4808d4510be0e3dc9565e9cbd3/raw/9b717589ca44cedc8aaf00b2b8cacef922964c0f/starlette-sml.md',
      description: 'A subset of the Starlette documentation useful for FastHTML development',
    },
    {
      title: 'HTMX complete reference',
      url: 'https://github.com/bigskysoftware/htmx/blob/master/www/content/reference.md',
      description: 'Brief description of all HTMX attributes, CSS classes, headers, events, extensions, js lib methods, and config options',
    },
  ],
}

// Generate the llms.txt content
const llmsTxtContent = generateLLMsTxt(configWithOptional)

export { configWithOptional, llmsTxtContent }
