export const llmstxt = {
  title: 'This is the llmstxt export',
  description: 'Is used for generation when it exists.',
}
export const metadata = {
  title: 'This is the metadata export',
  description: 'This shouldn\'t be used for generation when llmstxt export exist!',
}

export default function AllExportsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">All Exports</h1>
      <p className="mb-4 text-gray-700">This page exports both <code>metadata</code> and <code>llmstxt</code>. The <code>llmstxt</code> export is used for generating <code>llms.txt</code>.</p>
      <div className="flex items-center gap-3 mb-6 text-xs">
        <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-800">llmstxt</span>
        <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-800">metadata</span>
      </div>
      <a className="underline" href="/all-exports.html.md">View Markdown</a>
      <div className="mt-6">
        <a className="underline" href="/">← Back to Home</a>
      </div>
    </>
  )
}
