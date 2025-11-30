# llms-txt-project

Monorepo for the next-llms-txt ecosystem.

## Project Structure

```
packages/
├── next-llms-txt/      # Main library package - Next.js plugin for generating llms.txt files
├── demo-server/        # Demo Next.js application showcasing the plugin
└── cypress-tests/      # E2E test suite
```

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm

### Installation

```bash
npm install
```

This will install dependencies for all workspace packages.

## Available Scripts

### Build

```bash
npm run build
```

Builds all packages in the workspace.

### Development

```bash
npm run dev              # Develop the main library
npm run server:demo      # Run the demo server
```

### Testing

```bash
npm test                 # Run all tests across workspaces
npm run test:unit        # Run unit tests
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run Cypress E2E tests
```

### Linting

```bash
npm run lint             # Lint all packages
npm run lint:fix         # Auto-fix linting issues
```

### Cypress

```bash
npm run cypress:open     # Open Cypress UI
npm run cypress:run      # Run Cypress tests headlessly
```

## Packages

### next-llms-txt

The main library package. See [packages/next-llms-txt/README.md](packages/next-llms-txt/README.md) for detailed documentation.

**Publishing:**
```bash
npm run publish:dry -w next-llms-txt  # Dry run
npm run publish -w next-llms-txt      # Actual publish
```

### demo-server

A Next.js application demonstrating the plugin in action.

```bash
npm run server:demo              # Development mode
npm run server:demo:build        # Production build
```

### cypress-tests

E2E test suite for integration testing.

## Configuration

- **TypeScript**: Shared base configuration at `tsconfig.base.json`, extended by all packages
- **ESLint**: Each package has its own configuration
- **Workspaces**: Managed via npm workspaces

## Contributing

See [packages/next-llms-txt/CONTRIBUTING.md](packages/next-llms-txt/CONTRIBUTING.md) for contribution guidelines.

## License

See [packages/next-llms-txt/LICENSE](packages/next-llms-txt/LICENSE).
