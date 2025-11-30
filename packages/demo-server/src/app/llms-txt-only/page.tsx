export const llmstxt = {
  title: 'This is the llmstxt export',
  description: 'Is used for generation when it exists.',
}

export default function LlmsTxtOnlyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">LLMs.txt Only</h1>
      <p className="mb-4 text-gray-700">This page exports only <code>llmstxt</code>. It contributes to <code>llms.txt</code> but has no static metadata.</p>
      <div className="flex items-center gap-3 mb-6 text-xs">
        <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-800">llmstxt</span>
        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">no metadata</span>
      </div>
      <a className="underline" href="/llms-txt-only.html.md">View Markdown</a>
      <div className="mt-6">
        <a className="underline" href="/">← Back to Home</a>
      </div>
    </>
  )
}
