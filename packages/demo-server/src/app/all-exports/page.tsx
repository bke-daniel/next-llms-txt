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
      <h1 className="text-3xl font-bold">Page with all exports</h1>
      <a href="/all-exports.html.md">All Exports Markdown</a>
    </>
  )
}
