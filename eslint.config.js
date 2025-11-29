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
    // Test naming conventions
    'test/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
    'test/no-focused-tests': 'error',
    'test/no-disabled-tests': 'warn',
    'test/prefer-lowercase-title': ['error', { ignore: ['describe'] }],
  },
})
