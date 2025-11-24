import createPageLLMsTxtHandlers from '../../src/create-page-llms-txt-handlers'

describe('createPageLLMsTxtHandlers', () => {
  it('returns a handler object with GET method', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com')
    expect(handler).toHaveProperty('GET')
    expect(typeof handler.GET).toBe('function')
  })

  it('handles undefined config', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com', undefined)
    expect(handler).toHaveProperty('GET')
  })

  it('merges baseUrl into autoDiscovery when autoDiscovery is object', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com', {
      autoDiscovery: {
        appDir: 'custom/app',
        rootDir: '/custom/root',
      },
    })
    expect(handler).toHaveProperty('GET')
  })

  it('creates autoDiscovery with baseUrl when autoDiscovery is not object', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com', {
      autoDiscovery: true,
    })
    expect(handler).toHaveProperty('GET')
  })

  it('passes through other config properties', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com', {
      defaultConfig: {
        title: 'Test',
      },
      trailingSlash: false,
    })
    expect(handler).toHaveProperty('GET')
  })

  it('ignores unexpected properties in config', () => {
    const handler = createPageLLMsTxtHandlers('https://example.com', { unexpected: 123 } as any)
    expect(handler).toHaveProperty('GET')
  })
})
