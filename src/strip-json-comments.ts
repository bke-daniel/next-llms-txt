/**
 * Strip JSON/JSONC comments
 * Handles single-line (//), multi-line comments and trailing commas
 */
export default function stripJsonComments(jsonString: string): string {
  let result = ''
  let i = 0
  let inString = false
  let inComment = false
  let commentType: 'line' | 'block' | null = null

  while (i < jsonString.length) {
    const char = jsonString[i]
    const nextChar = jsonString[i + 1]

    // Handle string boundaries (with proper escape handling)
    if (!inComment && char === '"' && (i === 0 || jsonString[i - 1] !== '\\')) {
      inString = !inString
      result += char
      i++
      continue
    }

    // If we're in a string, just copy the character
    if (inString) {
      result += char
      i++
      continue
    }

    // Handle end of line comment
    if (inComment && commentType === 'line' && (char === '\n' || char === '\r')) {
      inComment = false
      commentType = null
      result += char // Keep newlines
      i++
      continue
    }

    // Handle end of block comment
    if (inComment && commentType === 'block' && char === '*' && nextChar === '/') {
      inComment = false
      commentType = null
      result += '  ' // Replace with spaces
      i += 2
      continue
    }

    // If we're in a comment, replace with space (preserve positions)
    if (inComment) {
      result += (char === '\n' || char === '\r') ? char : ' '
      i++
      continue
    }

    // Check for start of line comment
    if (char === '/' && nextChar === '/') {
      inComment = true
      commentType = 'line'
      result += '  '
      i += 2
      continue
    }

    // Check for start of block comment
    if (char === '/' && nextChar === '*') {
      inComment = true
      commentType = 'block'
      result += '  '
      i += 2
      continue
    }

    // Regular character
    result += char
    i++
  }

  // Remove trailing commas
  result = result.replace(/,\s*(\}|\])/g, '$1')

  return result
}
