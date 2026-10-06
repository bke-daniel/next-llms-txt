// Loads the built bundle in plain Node.js, without a bundler, and exercises
// the handler once. Guards against #46: a specifier such as `next/server`
// resolves under Turbopack/webpack but not under Node's ESM resolver, because
// `next` has no `exports` map and Node does not add file extensions.
//
// Run after `npm run build -w next-llms-txt`: `npm run test:node-import`.

import assert from 'node:assert/strict'
import process from 'node:process'

async function main() {
  const dist = await import('../../dist/index.mjs')

  assert.equal(typeof dist.createLLmsTxt, 'function', 'createLLmsTxt export')
  assert.equal(typeof dist.isLLMsTxtPath, 'function', 'isLLMsTxtPath export')
  assert.ok(dist.LLMsTxtError.prototype instanceof Error, 'LLMsTxtError extends Error')

  const { GET } = dist.createLLmsTxt({
    baseUrl: 'https://example.com',
    defaultConfig: { title: 'Node import probe' },
    autoDiscovery: false,
  })
  const response = await GET(new Request('https://example.com/llms.txt'))

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8')
  assert.match(await response.text(), /^# Node import probe\n/)

  process.stdout.write('dist/index.mjs loads and serves /llms.txt in plain Node.js\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
