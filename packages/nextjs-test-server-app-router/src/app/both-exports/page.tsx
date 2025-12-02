import type { LLMsTxtConfig } from 'next-llms-txt'

export const llmstxt: LLMsTxtConfig = {
  title: 'next-llms-txt app-router-test-server',
  description: 'This is the llmstxt export for next-llms-txt\'s app router tests',
}

export const metadata = {
  title: 'next-llms-txt app-router-test-server',
  description: 'METADATA: This is the metadata export for next-llms-txt\'s app router tests',
}


export default function BothExportsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Both Exports Page</h1>
      <p className="mb-4">
        This page exports both llmstxt configuration and metadata for the LLMs.txt configuration.
      </p>
    </>
  )
}
