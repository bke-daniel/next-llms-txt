export const metadata = {
  title: 'This is the metadata export',
  description: 'This shouldn\'t be used for generation when llmstxt export exist!',
}
export default function MetadataOnlyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Metadata Only</h1>
      <p className="mb-4 text-gray-700">This page exports only <code>metadata</code>. Without a <code>llmstxt</code> export, it won’t contribute to <code>llms.txt</code>.</p>
      <div className="flex items-center gap-3 mb-6 text-xs">
        <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-800">metadata</span>
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">no llmstxt</span>
      </div>
      <a className="underline" href="/metadata-only.html.md">View Markdown</a>
      <div className="mt-6">
        <a className="underline" href="/">← Back to Home</a>
      </div>
    </>
  )
}
