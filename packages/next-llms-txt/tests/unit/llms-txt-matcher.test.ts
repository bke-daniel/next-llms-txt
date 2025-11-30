import { isLLMsTxtPath } from '../../src/llms-txt-matcher'

describe('test isLLMsTxtPath', () => {
  it('should match /llms.txt', () => {
    expect(isLLMsTxtPath('/llms.txt')).toBe(true)
  })

  it('should match .html.md endpoints', () => {
    expect(isLLMsTxtPath('/foo/bar.html.md')).toBe(true)
    expect(isLLMsTxtPath('/index.html.md')).toBe(true)
  })

  it('should not match unrelated paths', () => {
    expect(isLLMsTxtPath('/foo/bar')).toBe(false)
    expect(isLLMsTxtPath('/llms.txtx')).toBe(false)
    expect(isLLMsTxtPath('/foo.html')).toBe(false)
    expect(isLLMsTxtPath('/foo.md')).toBe(false)
    expect(isLLMsTxtPath('/foo/index.html')).toBe(false)
  })
})
