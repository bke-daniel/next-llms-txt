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
      <h1 className="text-3xl font-bold mb-2">Full Test</h1>
      <p className="mb-4 text-gray-700">Comprehensive example with sections, items, and optional entries to validate end-to-end behavior.</p>
      <div className="flex items-center gap-3 mb-6 text-xs">
        <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-800">llmstxt</span>
        <span className="px-2 py-1 rounded-full bg-sky-100 text-sky-800">sections</span>
        <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-800">optional</span>
      </div>
      <a className="underline" href="/full-test.html.md">View Markdown</a>
      <div className="mt-6">
        <a className="underline" href="/">← Back to Home</a>
      </div>
    </>
  )
}
