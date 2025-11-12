import createMarkdownResponse from '../../src/create-markdown-response'

describe('createMarkdownResponse', () => {
  it('handles empty string', async () => {
    const response = createMarkdownResponse('')
    const text = await response.text()
    expect(text).toBe('')
  })

  it('handles very large string', async () => {
    const large = 'x'.repeat(100000)
    const response = createMarkdownResponse(large)
    const text = await response.text()
    expect(text.length).toBe(100000)
  })

  it('handles non-string input by coercion', async () => {
    // @ts-expect-error Testing non-string input
    const response = createMarkdownResponse(123)
    const text = await response.text()
    expect(text).toBe('123')
  })
  it('returns NextResponse with correct content', async () => {
    const content = 'Hello world'
    const response = createMarkdownResponse(content)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toMatch(/text\/plain/)
    expect(response.headers.get('Cache-Control')).toMatch(/max-age=3600/)
    const text = await response.text()
    expect(text).toBe(content)
  })
})
