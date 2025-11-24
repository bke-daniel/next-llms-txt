import normalizePath from '../../src/normalize-path'

describe('normalize path unit tests', () => {
  it('should handle index paths', () => {
    const input = '/services/consulting/index'
    const expected = '/services/consulting'
    const result = normalizePath(input)
    expect(result).toBe(expected)
  })

  it('handles /index and trailing slash', () => {
    expect(normalizePath('/foo/index')).toBe('/foo')
    expect(normalizePath('/foo/')).toBe('/foo')
    expect(normalizePath('/')).toBe('/')
  })

  it('handles root index path', () => {
    expect(normalizePath('/index')).toBe('/')
  })

  it('does not modify paths without trailing slash or index', () => {
    expect(normalizePath('/about')).toBe('/about')
    expect(normalizePath('/services/consulting')).toBe('/services/consulting')
  })

  it('handles nested index paths', () => {
    expect(normalizePath('/deeply/nested/path/index')).toBe('/deeply/nested/path')
  })
})
