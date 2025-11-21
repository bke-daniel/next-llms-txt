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
      <h1 className="text-3xl font-bold">Nested page with all exports</h1>
      <a href="/nested/all-exports.html.md">Nested with all exports llms.txt markdown</a>
    </>
  )
}
