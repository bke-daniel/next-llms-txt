export const llmstxt = {
  title: 'This is the llmstxt export',
  description: 'This should be used for generation',
}

export const metadata = {
  title: 'This is the metadata export',
  description: 'This shouldn\'t be used for generation!',
}

export default function AllExportsPage() {
  return (
    <>
      <h1>Nested page with all exports</h1>
    </>
  )
}
