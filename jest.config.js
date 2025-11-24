/** @type {import('jest').Config} */
const jestConfig = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/test/constants$': '<rootDir>/tests/constants.ts',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  // IMPORTANT: This allows Jest to transform ESM modules from node_modules
  // By default, Jest ignores node_modules. We need to transform strip-json-comments
  // because it's an ESM-only package (v5+)
  transformIgnorePatterns: [
    // Transform everything in node_modules EXCEPT strip-json-comments
    'node_modules/(?!(strip-json-comments)/)',
  ],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/', // Exclude e2e (cypress) tests from main test run
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts', // Exclude barrel exports from coverage
    '!src/discovery.ts', // Exclude complex AST parsing - integration tested
    '!src/constants.ts', // Exclude constants file
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}

export default jestConfig
