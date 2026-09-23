# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

`next-llms-txt` — a Next.js 16+ plugin that generates [llms.txt](https://llmstxt.org/) files for AI-discoverable site documentation. It hooks into Next's `proxy.ts` (Routing Middleware) to intercept `/llms.txt` and `/*.html.md` requests, auto-discovering page configs from `llmstxt` named exports or falling back to Next's `metadata` export.

This is an npm-publishable workspace monorepo. The publishable package lives at `packages/next-llms-txt/`.

## Repo layout

```
packages/
  next-llms-txt/                   # The publishable plugin (the only thing that ships to npm)
  nextjs-test-server-app-router/   # Live test harness — Next 16 App Router
  nextjs-test-server-pages-router/ # Live test harness — Next 16 Pages Router
  demo-server/                     # Larger demo with Tailwind, used as a Vercel preview
  cypress-tests/                   # Cypress E2E against the App Router test server (runs in CI)
examples/                          # Documentation-only example READMEs
```

## Tech stack

Versions live in the `package.json` files; this list only records the decisions behind them.

- **Next.js 16.3.x**, the same exact version in every workspace so npm hoists one copy (two copies make `NextRequest` types incompatible, and `eslint-config-next` needs `next` hoisted). App Router + Pages Router are both supported by the plugin.
- **React 19.2.6** / React DOM
- **TypeScript `~6.0.3`** in every workspace. The plugin's optional peer range is `^5.9.3 || ^6.0.0 || ^7.0.0`, but the repo cannot build or lint on TypeScript 7: it ships no JavaScript compiler API, which tsup's dts build and typescript-eslint (`<6.1.0`) need. TypeScript 7 is covered by the `typescript-compat` CI job instead (see CONTRIBUTING.md, "TypeScript Versions").
- **Node.js 24** (`.nvmrc`), `engines.node >=22.0.0`, `@types/node ^24` enforced by a root `overrides` entry. CI runs the unit tests on 22 and 24.
- **Vitest 4.1.x** + `@vitest/coverage-v8`
- **ESLint 9.39.x** for the Next.js consumer packages (eslint-config-next pins typescript-eslint 8, which is not ESLint-10-compatible)
- **ESLint 10.3.x** for the plugin itself (via `@antfu/eslint-config@9`)
- **tsup** for the plugin build (ESM only)
- `@babel/parser`/`traverse`/`types` — AST-driven auto-discovery of `llmstxt` exports

## Plugin internals (`packages/next-llms-txt/src/`)

| File | Responsibility |
|---|---|
| `index.ts` | Public re-exports (`createLLmsTxt`, `isLLMsTxtPath`, types) |
| `handler.ts` | Top-level `createLLmsTxt` factory — returns `{ GET }` |
| `handle-site-request.ts` | `/llms.txt` site-wide handler — drives discovery + section merge |
| `handle-page-request.ts` | `*.html.md` per-page handler |
| `discovery.ts` | `LLMsTxtAutoDiscovery` — App + Pages Router file walking and AST extraction |
| `generator.ts` | Markdown emission |
| `merge-with-default-config.ts` | User config × `DEFAULT_CONFIG` |
| `validate-config.ts` | Throws on missing/incomplete config |
| `constants.ts` | `DEFAULT_CONFIG` (frozen `autoDiscovery`) |
| `types.d.ts` | Public types |

## Mandatory test workflow — run for EVERY development task

Unit tests catch logic regressions. The live test servers catch contract regressions between the plugin and the actual Next.js runtime (proxy resolution, dev-mode bundling, AST extraction from real `page.tsx` files, dev-server caching). **Both must pass before you call any task done.**

### 1. Unit + integration suite

```bash
npm run test:unit -w next-llms-txt
npm run test:coverage:ci -w next-llms-txt   # gates: the `thresholds` in vitest.config.ts
npm run lint -w next-llms-txt
npm run build -w next-llms-txt
npm run type-check                          # every workspace; run after the build, the apps resolve the plugin through dist/
```

A green suite is necessary but not sufficient.

### 2. Live App Router server (`packages/nextjs-test-server-app-router/`)

```bash
npm run build -w next-llms-txt                  # always rebuild the plugin first
npm --prefix packages/nextjs-test-server-app-router run dev
```

Server comes up on **http://localhost:3000**.

Fixture pages: `/` (llmstxt), `/both-exports` (both), `/metadata-only` (metadata fallback).

Verify with curl:

```bash
# site-wide manifest
curl -s http://localhost:3000/llms.txt

# per-page markdown — llmstxt wins over metadata
curl -s http://localhost:3000/both-exports.html.md

# per-page markdown — metadata fallback
curl -s http://localhost:3000/metadata-only.html.md

# unknown page → 404
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/does-not-exist.html.md
```

Expected output for `/llms.txt`:

- HTTP 200, `Content-Type: text/markdown; charset=utf-8`
- `# DEFAULT CONFIG: …` title from `src/llms-txt-config.ts`
- A `## Main Pages` section with each discovered route exactly once
- No `## Pages` block (that's reserved for user-supplied `handlerConfig.pages`)

### 3. Live Pages Router server (`packages/nextjs-test-server-pages-router/`)

```bash
PORT=3001 npm --prefix packages/nextjs-test-server-pages-router run dev
```

Server comes up on **http://localhost:3001** (use a different port so it can run alongside the App Router server).

Verify with curl:

```bash
curl -s http://localhost:3001/llms.txt
curl -s http://localhost:3001/index.html.md
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/missing.html.md   # → 404
```

The Pages Router walker must skip `_app.tsx`, `_document.tsx`, `_error.tsx`, `404.tsx`, `500.tsx`, anything under `api/`, plus `*.test.*` / `*.spec.*` / `*.stories.*` / `*.d.ts` / `_`-prefixed files. If any of those appear in the output, that's a regression.

### 4. After UI- or contract-affecting changes

- Rebuild the plugin (`npm run build -w next-llms-txt`) before restarting either test server. The test servers depend on `dist/` via the workspace link.
- Hit both servers' `/llms.txt` and at least one `*.html.md` route.
- For per-page changes: `curl` the affected route directly and diff against expected output. Don't trust the server logs alone.
- Type-check the consumers: `cd packages/nextjs-test-server-app-router && npx tsc --noEmit` (and same for `-pages-router`, `demo-server`). The plugin's public types are part of the contract.

### 5. Killing stuck dev servers

```bash
lsof -ti:3000,3001 | xargs -r kill -9
```

## Workspace scripts

```bash
npm test                                       # lint + tests across the monorepo
npm run test:unit -w next-llms-txt              # vitest run
npm run test:watch -w next-llms-txt
npm run test:coverage -w next-llms-txt
npm run build -w next-llms-txt                  # tsup → dist/index.mjs + dist/index.d.ts
npm run lint -w next-llms-txt
npm run lint:fix -w next-llms-txt
```

Run a single workspace's test server from anywhere via `npm --prefix packages/<name> run dev`.

## Code conventions

- ESM-only. The plugin ships only `dist/index.mjs` + `dist/index.d.ts`.
- Path alias `@/*` is set up in the plugin's `tsconfig.json` for tests only — `src/` itself does not use it.
- `RequiredLLMsTxtHandlerConfig.autoDiscovery` is `Required<AutoDiscoveryConfig> | false` — narrow before accessing `.rootDir`.
- `DEFAULT_CONFIG.autoDiscovery` is `Object.freeze`d — never mutate it (use the `mergeWithDefaultConfig` output instead).
- `DEFAULT_CONFIG.autoDiscovery.rootDir` is `''` (the "unset" sentinel) and `discoverPages()` resolves `rootDir || process.cwd()` lazily at request time. Never set `rootDir` to `process.cwd()` at module-load time — that freezes the directory at first import and breaks discovery when cwd diverges later (e.g. under Cypress / a different invocation path). An explicitly configured `rootDir` still wins.
- `PageInfo` user-facing fields are optional except `route`. Internal discovery fills the rest in.
- Section titles in `generateSiteConfig` are derived from the first path segment of routes with two or more segments (`/docs/foo` → `Docs`). Routes with at most one segment (`/`, `/docs`) → `Main Pages`.
- When fixing a discovery bug, add a fixture under `packages/next-llms-txt/tests/fixtures/discovery-extras/` plus a regression test in `tests/unit/discovery-extras.test.ts`.

## Known constraints

- ESLint 10 in `packages/next-llms-txt/` lives alongside ESLint 9 in the Next.js consumer packages — that split is intentional; do not "unify" them until eslint-config-next picks up typescript-eslint 9+.
- Cypress binary install is blocked in sandboxed environments; `CYPRESS_INSTALL_BINARY=0 npm install` skips it.
- Every `tsc` run against a repo tsconfig needs `--noEmit` (the `type-check` scripts have it). Under TypeScript 6/7 `rootDir` defaults to the tsconfig directory, so an emitting run writes `.js` files next to sources outside it, even with `--outDir`.
- Husky's `prepare` step requires a git repo — fresh `git clone` is fine, `npm install` inside an unpacked tarball is not.

## Working notes

- When asked to plan: output only the plan. No code until told to proceed.
- When given a plan: follow it exactly. Flag real problems and wait.
- After 10+ messages: re-read any file before editing it. Auto-compaction may have destroyed your memory of its contents.
- For multi-file refactors: break into phases of max 5 files; commit each phase separately.
- When the user says "yes", "do it", or "push": execute. Don't repeat the plan.
- For UI- or contract-affecting changes: **spin up the relevant live test server and exercise the affected endpoints before reporting the task done.** Unit tests alone are not enough.
