export const metadata = {
  title: 'Proxy demo',
  description: 'Demonstrates middleware proxy handling for llms.txt and .html.md endpoints',
}

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">With Proxy</h1>
      <p className="mb-4">This demo enables a middleware proxy (see <code>src/middleware.ts</code>) that routes:</p>
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li><code>/llms.txt</code> → handled by <code>next-llms-txt</code> with auto-discovery config</li>
        <li><code>/:path*.html.md</code> → served as markdown content for compatible routes</li>
      </ul>
      <p className="mb-2">Try these endpoints:</p>
      <ul className="list-disc list-inside space-y-2">
        <li><a className="underline" href="/llms.txt">/llms.txt</a></li>
        <li><a className="underline" href="/nested/all-exports.html.md">/nested/all-exports.html.md</a></li>
      </ul>
      <div className="mt-8 text-sm text-gray-600">
        <p>Files involved: <code>src/middleware.ts</code>, <code>src/proxy.ts</code>, and <code>src/llms-txt-config.ts</code>.</p>
      </div>
    </>
  )
}
