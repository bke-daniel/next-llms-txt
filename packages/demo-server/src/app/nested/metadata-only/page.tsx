export const metadata = {
  title: 'This is the metadata export',
  description: 'This shouldn\'t be used for generation when llmstxt export exist!',
}

export default function NestedMetadataOnlyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Nested page without llmstxt export</h1>
      <p>But with static metadata</p>
    </>
  )
}
