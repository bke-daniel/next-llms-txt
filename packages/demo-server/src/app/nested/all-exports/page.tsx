export const llmstxt = {
  title: 'This is the llmstxt export',
  description: 'Is used for generation when it exists.',
}
export const metadata = {
  title: 'This is the metadata export',
  description: 'This shouldn\'t be used for generation when llmstxt export exist!',
}

export default function NestedAllExportsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Nested: All Exports</h1>
      <p className="mb-4 text-gray-700">This nested page exports both <code>metadata</code> and <code>llmstxt</code>. Discovery works across subpaths.</p>
      <div className="flex items-center gap-3 mb-6 text-xs">
        <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-800">llmstxt</span>
        <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-800">metadata</span>
        <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">nested</span>
      </div>
      <a className="underline" href="/nested/all-exports.html.md">View Markdown</a>
      <div className="mt-6">
        <a className="underline" href="/">← Back to Home</a>
      </div>
    </>
  )
}
