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

- Root `llms.txt` endpoint via auto-discovery; its list items link to the per-page `*.html.md` endpoints
- Pages that export different combinations of `metadata` and `llmstxt` handlers
- Nested routes to validate discovery across subpaths
- A comprehensive “Full Test” route used by e2e tests
- `src/proxy.ts` answering `/llms.txt` and every `*.html.md` request with one `createLLmsTxt` handler

See `src/app/page.tsx` for a linked overview of all demo routes.

## Editing

Modify `src/app/page.tsx` to adjust the landing content. The page auto-updates during `dev`.

Global configuration is in `src/llms-txt-config.ts`.

### Routes of Interest

- `src/proxy.ts`: answers `/llms.txt` and `/*.html.md` (matcher `['/llms.txt', '/:path*.html.md']`) with the handler from `createLLmsTxt`. This is the setup the library recommends.
- `src/app/llms.txt/route.ts` and `src/app/api/llms-md/route.ts`: older route-handler variants. The proxy answers `/llms.txt` and `*.html.md` before they are reached, so they only serve as reference.

### Demo Pages

- `all-exports/`, `metadata-only/`, `llms-txt-only/`, `no-exports/`
- Nested variants under `nested/`
- `full-test/` for a comprehensive configuration
- `with-proxy/` explaining the proxy setup

## Learn More

- `next-llms-txt` package: features and APIs in the [library README](../next-llms-txt/README.md); upgrading in the [update & upgrade guide](../next-llms-txt/UPGRADING.md).
- Next.js docs: https://nextjs.org/docs
