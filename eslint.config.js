import antfu from '@antfu/eslint-config'

export default antfu({
  // Enable TypeScript support
  typescript: true,
  // Enable Jest support
  test: {
    files: ['**/*.test.ts', '**/*.test.js', '**/tests/**/*', '**/__tests__/**/*'],
  },
  // Ignore markdown files to prevent parsing errors
  ignores: [
    '**/*.md',
    'dist/**',
    'node_modules/**',
  ],
  // Customize rules if needed
  rules: {
    // Add any custom rules here
  },
})
