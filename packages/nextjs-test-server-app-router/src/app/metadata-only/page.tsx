export const metadata = {
  title: 'next-llms-txt app-router-test-server',
  description: 'METADATA: This is the metadta export for next-llms-txt\'s app router tests',
}

export default function MetadataOnlyPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Metadata Only Page</h1>
      <p className="mb-4">
        This page exports only metadata for the LLMs.txt configuration. It does not have any explicit content handlers.
      </p>
    </>
  )
}
