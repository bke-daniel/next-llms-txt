Demo server for `next-llms-txt`. It showcases multiple routes and configurations demonstrating how `llms.txt` can be discovered and served in a Next.js app. Use it to visually explore auto-discovery, per-page markdown endpoints, and different export combinations.

## Quick Start

From the monorepo root:

```bash
npm run server:demo
```

Open [http://localhost:3000](http://localhost:3000) to browse the demos.

Alternatively, from this package directory:

```bash
npm run dev
```

## What’s Inside

- Root `llms.txt` endpoint via auto-discovery
- Pages that export different combinations of `metadata` and `llmstxt` handlers
- Nested routes to validate discovery across subpaths
- A comprehensive “Full Test” route used by e2e tests
- Proxy demo showing edge rewrite of `*.html.md` to a Node.js API route

See `src/app/page.tsx` for a linked overview of all demo routes.

## Editing

Modify `src/app/page.tsx` to adjust the landing content. The page auto-updates during `dev`.

Global configuration is in `src/llms-txt-config.ts`.

### Routes of Interest

- `src/app/llms.txt/route.ts`: Node.js runtime route generating the root `llms.txt` via `createLLmsTxt`.
- `src/proxy.ts`: Edge proxy; rewrites `*.html.md` to `/api/llms-md` for markdown responses.
- `src/app/api/llms-md/route.ts`: Node.js API route calling `createLLmsTxt` to produce page-specific markdown.

### Demo Pages

- `all-exports/`, `metadata-only/`, `llms-txt-only/`, `no-exports/`
- Nested variants under `nested/`
- `full-test/` for a comprehensive configuration
- `with-proxy/` explaining the proxy setup

## Learn More

- `next-llms-txt` package: explore features and APIs in the main library README.
- Next.js docs: https://nextjs.org/docs
