import antfu from '@antfu/eslint-config'

export default antfu({
  // Enable TypeScript support
  typescript: true,
  test: {
    files: ['**/*.test.ts', '**/*.test.js', '**/tests/**/*', '**/__tests__/**/*'],
  },
  // Ignore markdown files to prevent parsing errors
  ignores: [
    '**/*.md',
    'dist/**',
    'node_modules/**',
    'packages/**',
    '.github/ISSUE_TEMPLATE/**/*',
  ],
  // Customize rules if needed
  rules: {
    // Add any custom rules here
  },
})
