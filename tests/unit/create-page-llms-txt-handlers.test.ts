import createPageLLMsTxtHandlers from '../../src/create-page-llms-txt-handlers'

describe('createPageLLMsTxtHandlers', () => {
  it('returns a handler object with GET method', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com')
    expect(handler).toHaveProperty('GET')
    expect(typeof handler.GET).toBe('function')
  })
})
