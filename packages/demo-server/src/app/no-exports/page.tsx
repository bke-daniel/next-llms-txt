export default function NoExportAtAllPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Page with no exports</h1>
      <p>This page has no exports at all - should generate warnings</p>
      <a href="/no-exports.html.md">No Exports Markdown</a>
    </>
  )
}
