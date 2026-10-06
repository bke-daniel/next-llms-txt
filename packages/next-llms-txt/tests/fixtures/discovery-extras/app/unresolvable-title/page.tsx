// A title that cannot be read statically. The page must still be listed
// (with a route-derived title) and must not crash the *.html.md route.
function computeTitle() {
  return 'Computed'
}

export const llmstxt = {
  title: computeTitle(),
  description: 'Title comes from a function call',
}

export default function UnresolvableTitlePage() {
  return null
}
