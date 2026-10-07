# llms-txt-project

Monorepo for the next-llms-txt ecosystem.

## Project Structure

```
packages/
├── next-llms-txt/                    # The library published to npm
├── nextjs-test-server-app-router/    # Test harness: Next.js App Router
├── nextjs-test-server-pages-router/  # Test harness: Next.js Pages Router
├── demo-server/                      # Demo app, deployed as the Vercel preview
└── cypress-tests/                    # E2E suite against the App Router test server
examples/                             # Example setups (READMEs only)
```

## Getting Started

### Prerequisites

- Node.js 22 or newer (`.nvmrc` pins 24)
- npm

### Installation

```bash
npm install
```

This installs the dependencies of all workspace packages. Without the Cypress binary (for example in sandboxed environments): `CYPRESS_INSTALL_BINARY=0 npm install`.

## Available Scripts

### Build

```bash
npm run build            # Build every workspace that has a build script
npm run build -w next-llms-txt   # Build the library only (dist/index.mjs + dist/index.d.ts)
```

The test servers and the demo use the library through `dist/`, so build it before starting them.

### Development

```bash
npm run dev              # Rebuild the library on change
npm run server:test      # App Router test server on http://localhost:3001
npm run server:demo      # Demo server on http://localhost:3000
```

### Testing

```bash
npm test                 # Lint and tests in every workspace, including the Cypress E2E run
npm run test:unit        # Library unit tests
npm run test:coverage    # Library unit tests with coverage
npm run type-check       # Type-check every workspace (build the library first)
npm run test:e2e         # Start the test server and run Cypress headlessly
npm run test:e2e:dev     # Start the test server and open the Cypress UI
```

### Linting

```bash
npm run lint             # Lint all packages
npm run lint:fix         # Auto-fix linting issues
```

### Cypress

```bash
npm run cypress:open     # Open the Cypress UI
npm run cypress:run      # Run Cypress headlessly
```

Both expect the test server on port 3001 to be running (`npm run server:test`); `test:e2e` and `test:e2e:dev` start it for you.

## Packages

### next-llms-txt

The main library package, currently at version 3.0. See [packages/next-llms-txt/README.md](packages/next-llms-txt/README.md) for the documentation, [UPGRADING.md](packages/next-llms-txt/UPGRADING.md) for the update & upgrade guide and [CHANGELOG.md](packages/next-llms-txt/CHANGELOG.md) for all changes.

### demo-server

A Next.js application demonstrating the plugin in action.

```bash
npm run server:demo              # Development mode
npm run server:demo:build        # Production build (builds the library first)
```

### cypress-tests

E2E test suite for integration testing; see [Cypress](#cypress).

## Releasing

Releases are published from a local machine; there is no release workflow in CI. The version in `packages/next-llms-txt/package.json` must already be set and listed in the changelog.

**1. Start from a clean, up-to-date `main`.**

```bash
git checkout main && git pull
npm ci
npm run build -w next-llms-txt
npm run test:unit -w next-llms-txt && npm run lint -w next-llms-txt && npm run type-check
```

**2. Check the package contents.** Only `dist/index.mjs`, `dist/index.d.ts`, `README.md`, `LICENSE` and `package.json` should be listed.

```bash
npm pack --dry-run -w next-llms-txt
npm publish --dry-run -w next-llms-txt
```

**3. Publish.** `prepublishOnly` builds the library again; `publishConfig.access` is already `public`.

```bash
npm whoami                       # if not logged in: npm login
npm publish -w next-llms-txt     # add --otp=<code> when 2FA is enabled
```

**4. Tag the release and create the GitHub release.**

```bash
git tag -a v3.0.0 -m "next-llms-txt 3.0.0"
git push origin v3.0.0
```

On GitHub, draft a release from the tag and paste the version's section from `packages/next-llms-txt/CHANGELOG.md`.

**5. Verify.**

```bash
npm view next-llms-txt version
```

A published version can only be unpublished within 72 hours (`npm unpublish next-llms-txt@<version>`); after that, use `npm deprecate`.

## Configuration

- **TypeScript**: Shared base configuration at `tsconfig.base.json`, extended by `next-llms-txt` and `demo-server`. The test servers and `cypress-tests` keep the standalone tsconfig their framework generates. The repository builds and lints on TypeScript 6.0; `npm run type-check` checks every workspace, and CI repeats the check with TypeScript 5.9, 6.0 and 7.0.
- **ESLint**: Each package has its own configuration
- **Workspaces**: Managed via npm workspaces

## Contributing

See [packages/next-llms-txt/CONTRIBUTING.md](packages/next-llms-txt/CONTRIBUTING.md) for contribution guidelines.

## License

See [packages/next-llms-txt/LICENSE](packages/next-llms-txt/LICENSE).
