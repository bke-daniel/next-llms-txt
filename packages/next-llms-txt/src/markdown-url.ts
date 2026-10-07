import normalizePath from './normalize-path.js'

/**
 * Build the URL of a route's markdown variant, the one `handlePageRequest`
 * serves: `/docs/guide` → `${baseUrl}/docs/guide.html.md`. The root has no
 * file name, so it maps to `/index.html.md` as llmstxt.org prescribes.
 */
export default function toMarkdownUrl(baseUrl: string, route: string): string {
  const normalized = normalizePath(route)
  return `${baseUrl}${normalized === '/' ? '/index' : normalized}.html.md`
}
