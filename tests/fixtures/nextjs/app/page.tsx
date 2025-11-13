export const metadata = {
  title: 'next-llms-txt test-server',
  description: 'This is a test server for next-llms-txt\'s e2e tests',
}

export default function Page() {
  return (
    <>
      <h1>next-llms-txt test-server</h1>
      <ul>
        <li><a href="/all-exports/">All Exports</a></li>
        <li><a href="/metadata-only/">Metadata Only</a></li>
        <li><a href="/no-exports/">No Export at all</a></li>
      </ul>
    </>
  )
}
