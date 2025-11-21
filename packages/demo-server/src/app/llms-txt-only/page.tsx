export const llmstxt = {
  title: 'This is the llmstxt export',
  description: 'Is used for generation when it exists.',
}

export default function LlmsTxtOnlyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Nested page with only llmstxt export</h1>
      <a href="/llms-txt-only.html.md">LLMs.txt Only Markdown</a>
    </>
  )
}
