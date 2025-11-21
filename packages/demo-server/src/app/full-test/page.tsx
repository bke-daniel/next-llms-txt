import type { LLMsTxtConfig } from 'next-llms-txt'

export const llmstxt: LLMsTxtConfig = {
  title: 'Test LLMs.txt',
  description: 'This is a test llms.txt file',
  sections: [
    {
      title: 'Main Section',
      description: 'This is the main section',
      items: [
        {
          title: 'Item One',
          url: '/item-one',
          description: 'Description for item one',
        },
        {
          title: 'Item Two',
          url: '/item-two',
        },
      ],
    },
  ],
  optional: [
    {
      title: 'Optional Item',
      url: '/optional-item',
      description: 'This is an optional item',
    },
  ],
}

export default function FullTestPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Full Test Page</h1>
      <a href="/full-test.html.md">Full Test Markdown</a>
    </>
  )
}
