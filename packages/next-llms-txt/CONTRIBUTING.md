# Contributing to next-llms-txt

Thanks for your interest in contributing! This guide covers the practical setup and the workflow we run on every change.

## Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/<your-username>/next-llms-txt.git
   cd next-llms-txt
   ```

2. **Install dependencies** (monorepo root)

   ```bash
   npm install
   ```

   `--legacy-peer-deps` is required because some peer ranges lag React 19.2.
   Cypress binary download is blocked in sandboxed environments; use
   `CYPRESS_INSTALL_BINARY=0 npm install` if you don't need the E2E suite.

3. **Build the plugin** (`packages/next-llms-txt/`)

   ```bash
   npm run build -w next-llms-txt
   ```

   This emits `dist/index.mjs` and `dist/index.d.ts`. The test servers
   (`packages/nextjs-test-server-{app,pages}-router/`) consume the
   workspace package via npm symlinks — always rebuild before restarting
   a test server so the dev server picks up your changes.

4. **Watch mode** (only the plugin)

   ```bash
   npm run dev -w next-llms-txt
   ```

## Mandatory test workflow

Unit tests catch logic regressions. The live test servers catch contract
regressions between the plugin and the actual Next.js runtime. Run both
before pushing.

```bash
# 1. Unit + integration suite
npm run test:unit       -w next-llms-txt
npm run test:coverage:ci -w next-llms-txt   # gates declared in vitest.config.ts
npm run lint            -w next-llms-txt
npm run build           -w next-llms-txt

# 2. Live App Router server (:3000)
npm --prefix packages/nextjs-test-server-app-router run dev
# In another shell:
curl -s http://localhost:3000/llms.txt
curl -s http://localhost:3000/both-exports.html.md
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/unknown.html.md   # → 404

# 3. Live Pages Router server (:3001)
PORT=3001 npm --prefix packages/nextjs-test-server-pages-router run dev
curl -s http://localhost:3001/llms.txt
curl -s http://localhost:3001/index.html.md
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/missing.html.md   # → 404
```

Kill stuck dev servers with `lsof -ti:3000,3001 | xargs -r kill -9`.

## Project Structure

```
packages/
  next-llms-txt/                   # The publishable plugin
    src/
      handler.ts                   # createLLmsTxt factory + dispatch
      handle-site-request.ts       # /llms.txt handler
      handle-page-request.ts       # *.html.md handler
      discovery.ts                 # AST-driven page discovery (App + Pages)
      generator.ts                 # Markdown emission
      merge-with-default-config.ts # config × DEFAULT_CONFIG
      validate-config.ts           # fail-fast config validation
      request-signal.ts            # AbortSignal composition for #23
      errors.ts                    # LLMsTxtError class hierarchy
      types.d.ts                   # Public types
    tests/                         # Unit + integration + fixtures
  nextjs-test-server-app-router/   # Live harness for the App Router
  nextjs-test-server-pages-router/ # Live harness for the Pages Router
  demo-server/                     # Larger demo (Tailwind, Vercel preview)
  cypress-tests/                   # E2E suite (disabled in sandboxed CI)
```

## Making Changes

1. **Create a feature branch** — use the team conventions (`f/<n>/...`
   for features, `b/<n>/...` for bug fixes).

2. **Implement your change** — follow the existing code style; add
   TypeScript types for all new code.

3. **Add tests** — unit tests live in `packages/next-llms-txt/tests/unit/`,
   integration in `tests/integration/`. When adding a discovery edge case,
   add a fixture under `tests/fixtures/discovery-extras/` so the test stays
   self-contained.

4. **Run the full verification flow** above. Both the unit suite AND the
   two live test servers must be green.

5. **Update docs** — README, CHANGELOG, and any relevant JSDoc.

6. **Commit** using conventional commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation only
   - `chore:` maintenance
   - `refactor:` code refactor
   - `perf:` performance change
   - `test:` test-only change

## Code Style

- TypeScript strict mode. No unjustified `any`.
- `@antfu/eslint-config` enforces formatting; run `npm run lint:fix -w
  next-llms-txt` to auto-fix.
- Path alias `@/*` resolves to `src/*` for tests only; `src/` itself
  imports relatively.
- Public API stays minimal. `PageInfo` is internal — consumer pages
  should use `LLMsTxtPage`.

## Pull Request Checklist

1. [ ] `npm run test:unit -w next-llms-txt` is green (≥ matching the
       thresholds declared in `vitest.config.ts`).
2. [ ] `npm run lint -w next-llms-txt` reports only the pre-existing
       disabled-suite warning, no new errors.
3. [ ] `npm run build -w next-llms-txt` emits cleanly.
4. [ ] `npm run type-check` is green (run it after the build: the apps
       resolve the plugin's types through `dist/`).
5. [ ] Both live test servers were exercised for any UI- or contract-
       affecting change.
6. [ ] CHANGELOG.md updated.
7. [ ] PR description explains the *why*, not just the *what*.

## TypeScript Versions

The plugin supports consumers on TypeScript 5.9, 6.x and 7.x, but the
repository itself stays on TypeScript 6.0 (`~6.0.3` in every workspace).
TypeScript 7 ships no JavaScript compiler API, which tsup's declaration
build and typescript-eslint both need, and typescript-eslint supports
`<6.1.0` only. Keep the range identical across workspaces so npm hoists a
single compiler.

The `typescript-compat` job in `.github/workflows/test.yml` installs each
supported version side by side and type-checks the sources, the workspace
apps and `tests/type-consumer/` (a consumer of the published
`dist/index.d.ts`). To reproduce one leg locally after a build:

```bash
npx -y -p typescript@~7.0.0 tsc -p packages/next-llms-txt/tests/type-consumer/tsconfig.json
```

Do not put options that only one version understands into a shared
tsconfig. `ignoreDeprecations: "6.0"`, for example, is rejected by
TypeScript 5.9, which is why it lives in `tsup.config.ts`.

## Node.js Typings

`@types/node` follows the Node.js major in `.nvmrc` (24), so the compiler
never accepts an API the runtime does not have. Every workspace declares
`^24`, and the root `package.json` repeats it under `overrides`: some
transitive dependencies ask for `@types/node: "*"`, which would otherwise
hoist the newest major next to ours. Dependabot ignores versions outside
24.x. Raise all three together when `.nvmrc` moves to a new major.

The plugin supports Node.js 22 and up (`engines.node`). The typings cannot
flag an API that only exists in Node 24, so the `test` job in CI runs on
both 22 and 24. Everything else in CI runs on the `.nvmrc` version.

## Versioning

The plugin follows SemVer:

- **Major** — breaking changes to the public API (see `src/index.ts` /
  `src/types.d.ts`)
- **Minor** — additive features, new optional config fields
- **Patch** — bug fixes, internal refactors with no contract change

## Code of Conduct

Be respectful, give constructive feedback, focus on what's best for the
project.

## License

Contributions are licensed under the MIT License.
