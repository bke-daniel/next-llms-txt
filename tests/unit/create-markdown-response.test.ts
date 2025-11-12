import createMarkdownResponse from '../../src/create-markdown-response'

describe('createMarkdownResponse', () => {
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
