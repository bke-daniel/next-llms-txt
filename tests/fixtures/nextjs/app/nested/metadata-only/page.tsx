export const metadata = {
  title: 'Service Without Export',
  description: 'This service uses metadata fallback for llms.txt generation',
}

export default function MetadataOnlyPage() {
  return (
    <>
      <h1>Nested page without llmstxt export</h1>
      <p>But with static metadata</p>
    </>
  )
}
