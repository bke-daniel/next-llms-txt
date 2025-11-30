export default function NoExportAtAllPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">No Exports</h1>
      <p className="mb-4 text-gray-700">This page has neither <code>metadata</code> nor <code>llmstxt</code> exports. Useful for testing default behavior and warnings.</p>
      <div className="flex items-center gap-3 mb-6 text-xs">
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">no exports</span>
      </div>
      <a className="underline" href="/no-exports.html.md">View Markdown</a>
      <div className="mt-6">
        <a className="underline" href="/">← Back to Home</a>
      </div>
    </>
  )
}
