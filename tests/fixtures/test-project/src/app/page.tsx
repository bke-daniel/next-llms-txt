import type { LLMsTxtConfig } from '../../../../../src/types'

export const metadata = {
  title: 'Next.js LLMs.txt Demo',
  description: 'Homepage demonstrating automatic llms.txt generation',
}

export const llmstxt: LLMsTxtConfig = {
  title: 'Next.js LLMs.txt Demo',
  description: 'Homepage demonstrating automatic llms.txt generation with comprehensive page discovery',
  sections: [
    {
      title: 'Getting Started',
      items: [
        {
          title: 'Installation Guide',
          url: '/docs/installation',
          description: 'How to install and configure next-llms-txt',
        },
        {
          title: 'Quick Start',
          url: '/docs/quick-start',
          description: 'Get up and running in 5 minutes',
        },
      ],
    },
  ],
}

export default function HomePage() {
  return (
    <div>
      <h1>Next.js LLMs.txt Demo</h1>
      <p>Welcome to the demo site showcasing automatic llms.txt generation.</p>
    </div>
  )
}
