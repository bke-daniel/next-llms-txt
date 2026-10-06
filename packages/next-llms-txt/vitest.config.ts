import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    setupFiles: ['tests/setup.ts'],
    environment: 'node',
    clearMocks: true,
    globals: true,
    useAtomics: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov', 'html', 'json-summary', 'json'],
      reportOnFailure: true,
      include: ['src/**/*.ts'],
      exclude: [
        // Type declarations only — nothing executable.
        'src/**/*.d.ts',
        // Public re-exports — pure pass-through with no logic worth covering.
        'src/index.ts',
      ],
      thresholds: {
        // discovery.ts was previously excluded from the coverage report
        // (audit P3 #45). It's now included; the floors below sit a few
        // points beneath the current measured numbers so regressions
        // trip CI but routine churn doesn't. Raise them as coverage of
        // the AST/path-resolution branches improves.
        lines: 85,
        functions: 95,
        branches: 75,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@/src': fileURLToPath(new URL('./src', import.meta.url)),
      '@/test/constants': fileURLToPath(new URL('./tests/constants.ts', import.meta.url)),
    },
  },
})
