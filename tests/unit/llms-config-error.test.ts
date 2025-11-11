import { createLLmsTxt } from '../../src/handler'

describe.skip('llms.txt config error', () => {
  it('throws if both defaultConfig and autoDiscovery are present', () => {
    expect(() => {
      createLLmsTxt({
        defaultConfig: { title: 'Test', description: 'desc' },
        autoDiscovery: { baseUrl: 'http://localhost:3000' },
      })
    }).toThrow(/Cannot use both manual config and auto-discovery together/)
  })

  it('throws if both manual config and autoDiscovery are present (manual)', () => {
    expect(() => {
      createLLmsTxt({
        title: 'Test',
        description: 'desc',
        autoDiscovery: { baseUrl: 'http://localhost:3000' },
      } as any)
    }).toThrow(/Cannot use both manual config and auto-discovery together/)
  })
})
