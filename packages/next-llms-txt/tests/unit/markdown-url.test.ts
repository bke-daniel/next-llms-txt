import toMarkdownUrl from '../../src/markdown-url'

describe('toMarkdownUrl', () => {
  it('appends .html.md to a route', () => {
    expect(toMarkdownUrl('https://example.com', '/docs/guide')).toBe('https://example.com/docs/guide.html.md')
  })

  it('maps the root to /index.html.md', () => {
    expect(toMarkdownUrl('https://example.com', '/')).toBe('https://example.com/index.html.md')
    expect(toMarkdownUrl('https://example.com', '')).toBe('https://example.com/index.html.md')
  })

  it('normalises trailing slashes, /index suffixes and backslashes', () => {
    expect(toMarkdownUrl('', '/docs/')).toBe('/docs.html.md')
    expect(toMarkdownUrl('', '/docs/index')).toBe('/docs.html.md')
    expect(toMarkdownUrl('', '\\docs\\guide')).toBe('/docs/guide.html.md')
  })
})
