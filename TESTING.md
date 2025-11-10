# Testing Guide

This document explains how to run tests for the `next-llms-txt` library.

## Test Structure

The test suite is organized into three main categories:

### 1. Unit Tests (`tests/unit/`)
- **`generator.test.ts`** - Tests the core `generateLLMsTxt` function
- **`handler.test.ts`** - Tests the API route handlers

### 2. Integration Tests (`tests/integration/`)  
- **`api-route.test.ts`** - Tests the complete API route functionality with Next.js
- **`static-generation.test.ts`** - Tests file system operations and static generation

### 3. End-to-End Tests (`tests/e2e/`)
- **`server-accessibility.e2e.test.ts`** - Tests actual Next.js server startup and HTTP accessibility

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Only E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test Files
```bash
# Unit tests only
npm test -- tests/unit/

# Integration tests only  
npm test -- tests/integration/

# Specific test file
npm test -- tests/unit/generator.test.ts
```

## What the Tests Cover

### Generator Function Tests
- Basic title-only generation
- Title with description  
- Multiple sections with items
- Items with and without descriptions
- Empty configurations
- Large configurations (performance)
- UTF-8 encoding and special characters

### Handler Function Tests
- Handler creation with valid configs
- Error handling for invalid configs
- NextResponse generation
- Content-Type headers
- Auth.js-style configuration patterns

### Integration Tests
- Complete API route flow
- Static file generation to filesystem
- llmstxt.org specification compliance
- Large configuration handling
- Concurrent request handling

### End-to-End Tests
- Next.js server startup
- HTTP accessibility of `/llms.txt` endpoint
- Static generation during build process
- Multiple concurrent requests
- Complete request/response cycle

## Test Configuration

The test setup uses:
- **Jest** as the test runner
- **ts-jest** for TypeScript support
- **supertest** for HTTP testing (in E2E tests)
- **@types/jest** for TypeScript definitions

Jest configurations:
- `jest.config.js` - Main configuration for unit and integration tests
- `jest.e2e.config.js` - Specific configuration for E2E tests with longer timeouts

## CI/CD Integration

To integrate with CI/CD pipelines, add these commands to your workflow:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm ci

- name: Run tests
  run: npm test

- name: Run E2E tests  
  run: npm run test:e2e

- name: Generate coverage report
  run: npm run test:coverage
```

## Test Data and Fixtures

Test configurations are defined inline in each test file to ensure clarity and maintainability. For E2E tests, temporary Next.js projects are created and cleaned up automatically.

## Troubleshooting

### E2E Tests Failing
- Ensure port 3001 is available
- Check that Node.js version supports the Next.js version used
- Verify npm is available in the PATH

### TypeScript Errors
- Run `npm install` to ensure all type definitions are installed
- Check that TypeScript version is compatible

### Coverage Issues
- Coverage reports are generated in the `coverage/` directory
- Open `coverage/index.html` in a browser to see detailed reports