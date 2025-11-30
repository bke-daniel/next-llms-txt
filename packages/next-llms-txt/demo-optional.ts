#!/usr/bin/env tsx

/**
 * Demo script to show the Optional section feature
 * Run with: npx tsx demo-optional.ts
 */

import type { LLMsTxtConfig } from './src/types'
import { generateLLMsTxt } from './src/generator'

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
      ],
    },
    {
      title: 'Examples',
      items: [
        {
          title: 'Todo list application',
          url: '/examples/adv_app.py',
          description: 'Detailed walk-thru of a complete CRUD app',
        },
      ],
    },
  ],
  optional: [
    {
      title: 'Starlette full documentation',
      url: 'https://gist.githubusercontent.com/jph00/809e4a4808d4510be0e3dc9565e9cbd3/raw/9b717589ca44cedc8aaf00b2b8cacef922964c0f/starlette-sml.md',
      description: 'A subset of the Starlette documentation useful for FastHTML development',
    },
  ],
}

const result = generateLLMsTxt(configWithOptional)

// Use console.error to avoid linter issues (allows warn/error)
console.error('='.repeat(60))
console.error('Generated llms.txt with Optional section:')
console.error('='.repeat(60))
console.error(result)
console.error('='.repeat(60))
console.error('Note: The "Optional" section contains secondary information')
console.error('that can be skipped for shorter context according to llmstxt.org')
console.error('='.repeat(60))
