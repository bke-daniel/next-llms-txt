import normalizePath from '../../src/normalize-path'

// TODO: Implement unit tests for normalize paths function
describe('normalize path unit tests', () => {
  // TODO check if test makes sense, may be deprecated
  it.skip('should normalize a path with trailing slash', () => {
    const input = '/about.html.md'
    const expected = '/about'
    const result = normalizePath(input)
    expect(result).toBe(expected)
  })

  // TODO check if test makes sense, may be deprecated
  it.skip('should normalize a path without trailing slash', () => {
    const input = '/services.html.md'
    const expected = '/services'
    const result = normalizePath(input)
    expect(result).toBe(expected)
  })

  // TODO check if test makes sense, may be deprecated
  it.skip('should handle nested paths', () => {
    const input = '/services/consulting.html.md'
    const expected = '/services/consulting'
    const result = normalizePath(input)
    expect(result).toBe(expected)
  })

  it('should handle index paths', () => {
    const input = '/services/consulting/index'
    const expected = '/services/consulting'
    const result = normalizePath(input)
    expect(result).toBe(expected)
  })
})
