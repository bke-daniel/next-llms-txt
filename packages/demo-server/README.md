Demo server for `next-llms-txt`. It showcases multiple routes and configurations demonstrating how `llms.txt` can be discovered and served in a Next.js app.

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
- Pages that export different combinations of metadata and handlers
- Nested routes to validate discovery across subpaths
- A comprehensive “Full Test” route used by e2e tests

See `src/app/page.tsx` for a linked overview of all demo routes.

## Editing

Modify `src/app/page.tsx` to adjust the landing content. The page auto-updates during `dev`.

Global configuration is in `src/llms-txt-config.ts`.

## Learn More

- `next-llms-txt` package: explore features and APIs in the main library README.
- Next.js docs: https://nextjs.org/docs
