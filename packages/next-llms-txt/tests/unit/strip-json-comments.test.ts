import stripJsonComments from '../../src/strip-json-comments'

describe('test stripJsonComments', () => {
  describe('basic functionality', () => {
    it('returns unchanged JSON without comments', () => {
      const json = '{"key": "value", "number": 123}'
      expect(stripJsonComments(json)).toBe(json)
    })

    it('handles empty string', () => {
      expect(stripJsonComments('')).toBe('')
    })

    it('handles empty JSON object', () => {
      const json = '{}'
      expect(stripJsonComments(json)).toBe(json)
    })

    it('handles empty JSON array', () => {
      const json = '[]'
      expect(stripJsonComments(json)).toBe(json)
    })
  })

  describe('line comments (//)', () => {
    it('removes single-line comment', () => {
      const json = '{"key": "value" // comment\n}'
      const result = stripJsonComments(json)
      expect(result).toContain('"key": "value"')
      expect(result).not.toContain('// comment')
    })

    it('removes line comment at end of file', () => {
      const json = '{"key": "value"} // comment'
      const result = stripJsonComments(json)
      expect(result).toContain('"key": "value"}')
      expect(result).not.toContain('// comment')
    })

    it('removes multiple line comments', () => {
      const json = `{
  // First comment
  "key1": "value1", // inline comment
  // Another comment
  "key2": "value2"
}`
      const result = stripJsonComments(json)
      expect(result).toContain('"key1": "value1"')
      expect(result).toContain('"key2": "value2"')
      expect(result).not.toContain('First comment')
      expect(result).not.toContain('inline comment')
      expect(result).not.toContain('Another comment')
    })

    it('preserves // inside strings', () => {
      const json = '{"url": "https://example.com", "comment": "not // a comment"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
      expect(result).toContain('https://')
      expect(result).toContain('not // a comment')
    })

    it('handles line comment with carriage return', () => {
      const json = '{"key": "value" // comment\r\n}'
      const result = stripJsonComments(json)
      expect(result).toContain('"key": "value"')
      expect(result).not.toContain('// comment')
    })

    it('handles line comment with only carriage return', () => {
      const json = '{"key": "value" // comment\r}'
      const result = stripJsonComments(json)
      expect(result).toContain('"key": "value"')
      expect(result).not.toContain('// comment')
    })
  })

  describe('block comments (/* */)', () => {
    it('removes single block comment', () => {
      const json = '{"key": /* comment */ "value"}'
      const result = stripJsonComments(json)
      expect(result).toContain('"key":')
      expect(result).toContain('"value"')
      expect(result).not.toContain('/* comment */')
    })

    it('removes multi-line block comment', () => {
      const json = `{
  "key1": "value1",
  /* This is a
     multi-line
     comment */
  "key2": "value2"
}`
      const result = stripJsonComments(json)
      expect(result).toContain('"key1": "value1"')
      expect(result).toContain('"key2": "value2"')
      expect(result).not.toContain('This is a')
      expect(result).not.toContain('multi-line')
      expect(result).not.toContain('comment */')
    })

    it('preserves /* */ inside strings', () => {
      const json = '{"text": "This is /* not */ a comment"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
      expect(result).toContain('This is /* not */ a comment')
    })

    it('handles multiple block comments', () => {
      const json = '{"key1": /* c1 */ "value1", "key2": /* c2 */ "value2"}'
      const result = stripJsonComments(json)
      expect(result).toContain('"key1":')
      expect(result).toContain('"value1"')
      expect(result).toContain('"key2":')
      expect(result).toContain('"value2"')
      expect(result).not.toContain('/* c1 */')
      expect(result).not.toContain('/* c2 */')
    })

    it('preserves newlines in block comments', () => {
      const json = `{
  /* comment
  with newline */
  "key": "value"
}`
      const result = stripJsonComments(json)
      expect(result).toContain('"key": "value"')
      const newlineCount = (result.match(/\n/g) || []).length
      expect(newlineCount).toBeGreaterThan(0)
    })
  })

  describe('trailing commas', () => {
    it('removes trailing comma in object', () => {
      const json = '{"key": "value",}'
      const result = stripJsonComments(json)
      expect(result).toBe('{"key": "value"}')
    })

    it('removes trailing comma in array', () => {
      const json = '[1, 2, 3,]'
      const result = stripJsonComments(json)
      expect(result).toBe('[1, 2, 3]')
    })

    it('removes trailing comma with whitespace', () => {
      const json = '{"key": "value",  }'
      const result = stripJsonComments(json)
      expect(result).toBe('{"key": "value"}')
    })

    it('removes trailing comma with newline', () => {
      const json = `{
  "key": "value",
}`
      const result = stripJsonComments(json)
      expect(result).not.toContain(',\n}')
      expect(JSON.parse(result)).toEqual({ key: 'value' })
    })

    it('handles multiple trailing commas', () => {
      const json = `{
  "obj": {"nested": "value",},
  "arr": [1, 2,],
}`
      const result = stripJsonComments(json)
      expect(result).not.toContain(',}')
      expect(result).not.toContain(',]')
    })
  })

  describe('string handling', () => {
    it('preserves escaped quotes in strings', () => {
      const json = '{"text": "He said \\"Hello\\""}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
    })

    it('handles strings with comment-like content', () => {
      const json = '{"url": "https://site.com", "note": "Check // and /* */ characters"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
    })

    it('handles empty strings', () => {
      const json = '{"empty": "", "key": "value"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
    })

    it('handles strings starting with quote', () => {
      const json = '{"key": "value"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
    })

    it('handles backslash at end of string', () => {
      const json = '{"path": "C:\\\\"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
    })
  })

  describe('mixed scenarios', () => {
    it('handles comments and trailing commas together', () => {
      const json = `{
  // Comment
  "key": "value",
}`
      const result = stripJsonComments(json)
      expect(result).not.toContain('// Comment')
      expect(result).not.toContain(',\n}')
      expect(JSON.parse(result)).toEqual({ key: 'value' })
    })

    it('handles line and block comments together', () => {
      const json = `{
  // Line comment
  "key1": "value1", /* block comment */
  "key2": "value2" // another line comment
}`
      const result = stripJsonComments(json)
      expect(result).toContain('"key1": "value1"')
      expect(result).toContain('"key2": "value2"')
      expect(result).not.toContain('Line comment')
      expect(result).not.toContain('block comment')
      expect(result).not.toContain('another line comment')
    })

    it('handles complex nested JSON with comments', () => {
      const json = `{
  // Configuration
  "name": "test",
  "nested": {
    /* Nested object */
    "key": "value",
  },
  "array": [
    1, // first
    2, /* second */
    3,
  ],
}`
      const result = stripJsonComments(json)
      expect(result).not.toContain('Configuration')
      expect(result).not.toContain('Nested object')
      expect(result).not.toContain('first')
      expect(result).not.toContain('second')
      expect(result).not.toContain(',]')
      expect(result).not.toContain(',}')

      const parsed = JSON.parse(result)
      expect(parsed.name).toBe('test')
      expect(parsed.nested.key).toBe('value')
      expect(parsed.array).toEqual([1, 2, 3])
    })

    it('handles real-world JSONC config', () => {
      const jsonc = `{
  // Server configuration
  "port": 3000,
  "host": "localhost", // Development host

  /* Database settings
     Multi-line comment */
  "database": {
    "url": "postgresql://localhost:5432/db", // Connection string
    "poolSize": 10,
  },

  "features": {
    "auth": true, // Enable authentication
    "logging": true, /* Enable logging */
  },
}`
      const result = stripJsonComments(jsonc)
      const parsed = JSON.parse(result)

      expect(parsed.port).toBe(3000)
      expect(parsed.host).toBe('localhost')
      expect(parsed.database.url).toBe('postgresql://localhost:5432/db')
      expect(parsed.database.poolSize).toBe(10)
      expect(parsed.features.auth).toBe(true)
      expect(parsed.features.logging).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles forward slash not part of comment', () => {
      const json = '{"division": "10/5", "key": "value"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
    })

    it('handles asterisk not part of comment', () => {
      const json = '{"math": "5*3", "key": "value"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
    })

    it('handles comment-like strings at start of value', () => {
      const json = '{"msg": "//start", "note": "/*block*/"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
    })

    it('handles unclosed block comment at end of file', () => {
      const json = '{"key": "value"} /* unclosed comment'
      const result = stripJsonComments(json)
      expect(result).toContain('"key": "value"}')
    })

    it('handles consecutive slashes in string', () => {
      const json = '{"url": "https:////example.com///path"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
      expect(result).toContain('https:////example.com///path')
    })
  })

  describe('whitespace preservation', () => {
    it('preserves indentation', () => {
      const json = `{
  "key": "value" // comment
}`
      const result = stripJsonComments(json)
      expect(result).toContain('  "key"')
    })

    it('preserves multiple spaces', () => {
      const json = '{"key":    "value"}'
      const result = stripJsonComments(json)
      expect(result).toBe(json)
    })

    it('preserves newlines between properties', () => {
      const json = `{
  "key1": "value1",

  "key2": "value2"
}`
      const result = stripJsonComments(json)
      expect(result).toContain('\n\n')
    })
  })
})
