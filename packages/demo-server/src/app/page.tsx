export const metadata = {
  title: 'next-llms-txt test-server',
  description: 'This is a test server for next-llms-txt\'s e2e tests',
}


import llmsTxtConfig from '../llms-txt-config'

function ConfigSummary() {
  const { defaultConfig, autoDiscovery } = llmsTxtConfig
  return (
    <div className="rounded-md border p-4 bg-gray-50" style={{ color: "#000" }}>
      <div className="mb-2">
        <span className="font-medium" >Title:</span> {defaultConfig?.title || '—'}
      </div>
      <div className="mb-2">
        <span className="font-medium">Description:</span> {defaultConfig?.description || '—'}
      </div>
      <div>
        <span className="font-medium">autoDiscovery.appDir:</span> <code>{autoDiscovery ? "true" : "false"}</code>
      </div>
    </div>
  )
}


export default function Page() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">
        <span className="italic">next-llms-txt</span> demo server
      </h1>

      <p className="mb-3 text-gray-700">Explore how <span className="italic">next-llms-txt</span> discovers and serves <code>llms.txt</code> from different routes and configurations. Each example demonstrates a specific setup.</p>

      <div className="mb-6 inline-flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">Next.js 16</span>
        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Tailwind</span>
        <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700">Auto-Discovery</span>
      </div>
      <p className="mb-6 text-sm text-gray-600">Tip: the <code>llms.txt</code> endpoint is intended for AI crawlers and LLM agents to discover allowed content and metadata.</p>

      <ul className="list-disc list-inside space-y-2">
        <li>
          <a href="/llms.txt/" className="underline font-medium">/llms.txt (auto discovery)</a>
          <span className="ml-2 inline-flex items-center gap-2 text-xs align-middle">
            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800">root</span>
            <span className="px-2 py-0.5 rounded bg-teal-200 text-teal-800">discovered</span>
          </span>
          <span className="block text-sm text-gray-600 mt-1">Generates <code>llms.txt</code> at the root using auto-discovery in the app directory.</span>
        </li>
        <li>
          <a href="/with-proxy/" className="underline font-medium">With Proxy</a>
          <span className="ml-2 inline-flex items-center gap-2 text-xs align-middle">
            <span className="px-2 py-0.5 rounded bg-orange-200 text-orange-800">edge</span>
            <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-800">rewrite</span>
          </span>
          <span className="block text-sm text-gray-600 mt-1">Demonstrates proxy handling for <code>/llms.txt</code> and <code>.html.md</code> content endpoints.</span>
        </li>
        <li>
          <a href="/all-exports/" className="underline">All Exports</a>
          <span className="block text-sm text-gray-600">Shows pages exporting metadata, content, and explicit <code>llms.txt</code> handlers.</span>
        </li>
        <li>
          <a href="/nested/all-exports/" className="underline">Nested with all Exports</a>
          <span className="block text-sm text-gray-600">Nested route demonstrating discovery across subpaths.</span>
        </li>
        <li>
          <a href="/metadata-only/" className="underline">Metadata Only</a>
          <span className="block text-sm text-gray-600">Pages exporting metadata only—no explicit content handlers.</span>
        </li>
        <li>
          <a href="/llms-txt-only/" className="underline">LLMs.txt export Only</a>
          <span className="block text-sm text-gray-600">Explicit <code>llms.txt</code> handler without other metadata exports.</span>
        </li>
        <li>
          <a href="/no-exports/" className="underline">No Export at all</a>
          <span className="block text-sm text-gray-600">Route without exports—useful to see default behavior.</span>
        </li>
        <li>
          <a href="/full-test/" className="underline">Full Test</a>
          <span className="block text-sm text-gray-600">Comprehensive setup for end-to-end testing.</span>
        </li>
      </ul>

      <div className="mt-8 text-sm text-gray-600">
        <p>
          Running locally? From the repo root, use <code>npm run server:demo</code> to start this demo at <a className="underline" href="http://localhost:3000">http://localhost:3000</a>.
        </p>
      </div>

      <hr className="my-8" />

      <section>
        <h2 className="text-xl font-semibold mb-3">Current Auto-Discovery Config</h2>
        <ConfigSummary />
      </section>
    </>
  )
}
