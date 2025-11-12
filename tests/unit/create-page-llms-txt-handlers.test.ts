import createPageLLMsTxtHandlers from '../../src/create-page-llms-txt-handlers'

describe('createPageLLMsTxtHandlers', () => {
  it('handles undefined config', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com', undefined)
    expect(handler).toHaveProperty('GET')
  })

  it('ignores unexpected properties in config', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com', { unexpected: 123 } as any)
    expect(handler).toHaveProperty('GET')
  })
  it('returns a handler object with GET method', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com')
    expect(handler).toHaveProperty('GET')
    expect(typeof handler.GET).toBe('function')
  })
})
