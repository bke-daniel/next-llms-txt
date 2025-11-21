export const metadata = {
  title: 'next-llms-txt test-server',
  description: 'This is a test server for next-llms-txt\'s e2e tests',
}

export default function Page() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">
        <span className="italic">next-llms-txt</span> demo server
      </h1>

      <p>For examples see below</p>

      <ul className="list-disc list-inside">
        <li><a href="/llms.txt/">/llms.txt with auto discovery</a></li>
        <li><a href="/all-exports/">All Exports</a></li>
        <li><a href="/nested/all-exports/">Nested with all Exports</a></li>
        <li><a href="/metadata-only/">Metadata Only</a></li>
        <li><a href="/llms-txt-only/">LLMs.txt export Only</a></li>
        <li><a href="/no-exports/">No Export at all</a></li>
        <li><a href="/full-test/">Full Test</a></li>
      </ul>
    </>
  )
}
