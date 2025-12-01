export const metadata = {
  title: 'This is the metadata export',
  description: 'This shouldn\'t be used for generation when llmstxt export exist!',
}
export default function MetadataOnlyPage() {
  return (
    <>
      <h1>Page without llmstxt export</h1>
      <p>But with static metadata</p>
      <a href="/metadata-only.html.md">Metadata Only Markdown</a>
    </>
  )
}
