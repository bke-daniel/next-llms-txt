# next-llms-txt

<p align="center">
  <a href="https://llmstxt.org">
    <img src="https://img.shields.io/badge/llms.txt-compatible-green" alt="llms.txt compatible" />
  </a>
  <a href="https://www.npmjs.com/package/next-llms-txt">
    <img src="https://img.shields.io/npm/v/next-llms-txt" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/next-llms-txt">
    <img src="https://img.shields.io/npm/dm/next-llms-txt" alt="npm downloads" />
  </a>
  <a href="https://github.com/bke-daniel/next-llms-txt/actions/workflows/test.yml">
    <img src="https://github.com/bke-daniel/next-llms-txt/actions/workflows/test.yml/badge.svg" alt="tests" />
  </a>
  <a href="https://codecov.io/gh/bke-daniel/next-llms-txt">
    <img src="https://codecov.io/gh/bke-daniel/next-llms-txt/branch/main/graph/badge.svg" alt="codecov" />
  </a>
  <a href="https://github.com/bke-daniel/next-llms-txt/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/next-llms-txt" alt="license" />
  </a>
</p>

LLM-focused content discovery and delivery for **Next.js 16+**. `next-llms-txt` generates a spec-compliant [`llms.txt`](https://llmstxt.org) for your site and serves a markdown version of every listed page at `<route>.html.md`. One function, wired into `proxy.ts`.

Current version: **3.0**. Coming from an older version? See the [update & upgrade guide](./UPGRADING.md).

Live demo: <https://next-llms-txt-demo-server.vercel.app>

## Contents

- [How it works](#how-it-works)
- [Quick Start](#quick-start)
- [Guides](#guides)
  - [Auto-discovery](#auto-discovery)
  - [Adding pages by hand](#adding-pages-by-hand)
  - [Manual sections only](#manual-sections-only)
  - [Per-page markdown (`.html.md`)](#per-page-markdown-htmlmd)
  - [Custom generator](#custom-generator)
  - [Errors, logging and timeouts](#errors-logging-and-timeouts)
- [Configuration reference](#configuration-reference)
- [API reference](#api-reference)
- [Compatibility](#compatibility)
- [Best practices](#best-practices)
- [FAQ](#faq)
- [Demo server](#demo-server)
- [Contributing](#contributing)
- [License](#license)

## How it works

LLMs struggle with hydrated React trees, client navigation and layout noise. The llms.txt specification answers this with a markdown index of a site's essential content plus links to clean markdown versions of its pages. `next-llms-txt` builds both from your Next.js project:

- **`/llms.txt`**: an H1 title, an optional blockquote description, and H2 sections whose list items link to your pages. Pages are found by scanning the App Router and Pages Router directories for an `llmstxt` export, falling back to Next.js `metadata`.
- **`/<route>.html.md`**: the markdown version of one page, generated on request from the same export. The root page is served at `/index.html.md`.
- **Links point at the markdown.** As llmstxt.org recommends, each list item links to the page's `.html.md` variant, not to the HTML page, so an agent following `llms.txt` lands on markdown directly.

```markdown
# My Website
> Documentation and guides for my product.

## Main Pages
- [Home](https://example.com/index.html.md): Welcome to my website
- [Pricing](https://example.com/pricing.html.md): Plans and prices

## Docs
- [Getting Started](https://example.com/docs/getting-started.html.md): Install and configure the product
```

Both endpoints are answered by a single handler from `createLLmsTxt`. Nothing is written to disk; every response is generated on demand.

## Quick Start

**1. Install the package.**

```bash
npm install next-llms-txt   # or: yarn add / pnpm add / bun add next-llms-txt
```

**2. Route `/llms.txt` and `*.html.md` through the handler in `src/proxy.ts`.**

```typescript
// src/proxy.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createLLmsTxt, isLLMsTxtPath } from 'next-llms-txt'

const { GET: handleLLmsTxt } = createLLmsTxt({
  baseUrl: 'https://example.com',
  defaultConfig: {
    title: 'My Website',
    description: 'Documentation and guides for my product.',
  },
  autoDiscovery: true,
})

export default async function proxy(request: NextRequest) {
  if (isLLMsTxtPath(request.nextUrl.pathname))
    return await handleLLmsTxt(request)
  return NextResponse.next()
}

export const config = {
  matcher: ['/llms.txt', '/:path*.html.md'],
}
```

**3. Describe your pages.** Export an `llmstxt` object (recommended), or rely on your existing `metadata` export:

```typescript
// src/app/pricing/page.tsx
import type { LLMsTxtConfig } from 'next-llms-txt'

export const llmstxt = {
  title: 'Pricing',
  description: 'Plans and prices',
} satisfies LLMsTxtConfig

export default function PricingPage() {
  return <main>…</main>
}
```

**4. Check the result.**

```bash
curl http://localhost:3000/llms.txt
curl http://localhost:3000/pricing.html.md
```

> **Why `proxy.ts` and not a route handler?** A route handler at `app/llms.txt/route.ts` only answers `/llms.txt`. The `.html.md` links inside it would answer 404. The proxy answers both with one matcher. If you list only links you write yourself, a route handler is enough; see [Manual sections only](#manual-sections-only).

## Guides

### Auto-discovery

Auto-discovery is **on by default**: it runs unless you pass `autoDiscovery: false`. Pass `true` for the defaults or an object to customise it (see [`AutoDiscoveryConfig`](#autodiscoveryconfig)).

**Where it looks.** `src/app` (App Router) and `src/pages` (Pages Router), relative to `rootDir`, which defaults to the working directory of the Next.js process at request time. When both routers register the same route, the App Router page wins. If none of the configured directories exists, a warning is always logged.

**What it reads.** For each page file it parses the source (no code is executed) and takes:

1. the `llmstxt` named export (rename it with `autoDiscovery.llmstxtExportName`), or
2. as a fallback, the `title` and `description` of the Next.js `metadata` export.

Values may be literals, constants declared in the same file, imports resolved through relative paths or `tsconfig` path aliases, and expressions wrapped in `as`, `satisfies` or `!`. Pages with neither export are left out of `llms.txt`, and their `.html.md` route answers 404.

**App Router rules.**

- `page.ts`, `page.tsx`, `page.js` and `page.jsx` are page entries (order set by `autoDiscovery.extensions`).
- Route groups count as no URL segment: `app/(marketing)/about/page.tsx` → `/about`.
- Private folders (`_components`), parallel-route slots (`@modal`) and intercepting routes (`(.)photo`) are skipped.

**Pages Router rules.**

- Every `.ts`, `.tsx`, `.js` and `.jsx` file is a page; `index` maps to its directory.
- Skipped: `_app`, `_document`, `_error`, `404`, `500`, any `_`-prefixed file or folder, the `api/` directory, and `*.test.*`, `*.spec.*`, `*.stories.*` and `*.d.ts` files.

**Dynamic segments** such as `[slug]` are not expanded. A dynamic page with an export is listed with the literal segment (`/blog/[slug].html.md`). Leave the export off such pages and list their concrete URLs through [`pages`](#adding-pages-by-hand) instead.

**Sections.** Discovered pages are grouped by the first path segment of routes with two or more segments (`/docs/getting-started` → `## Docs`). Routes with at most one segment (`/`, `/pricing`, `/docs`) go under `## Main Pages`. Sections from `defaultConfig.sections` come first, discovered sections after them.

### Adding pages by hand

Pass `pages` to list routes that discovery cannot see (dynamic routes, CMS pages) or to override a discovered page:

```typescript
createLLmsTxt({
  baseUrl: 'https://example.com',
  defaultConfig: { title: 'My Website' },
  pages: [
    { route: '/blog/hello-world', config: { title: 'Hello World', description: 'Our first post' } },
  ],
})
```

These entries appear under `## Pages`, linked as `https://example.com/blog/hello-world.html.md`, and are served at that route, even with `autoDiscovery: false`. A `pages` entry wins over a discovered page with the same route; the route then appears once, under `## Pages`. Entries without `config` are dropped.

### Manual sections only

To write every link yourself, turn discovery off. Without discovery and `pages`, `llms.txt` contains only your own links and no `.html.md` routes are involved, so a route handler is enough:

```typescript
// app/llms.txt/route.ts
import { createLLmsTxt } from 'next-llms-txt'

export const { GET } = createLLmsTxt({
  baseUrl: 'https://example.com',
  autoDiscovery: false,
  defaultConfig: {
    title: 'My Awesome Project',
    description: 'A comprehensive toolkit for developers.',
    sections: [
      {
        title: 'Documentation',
        items: [
          { title: 'Getting Started', url: 'https://example.com/docs/getting-started', description: 'A quick introduction for new users.' },
          { title: 'API Reference', url: 'https://example.com/docs/api' },
        ],
      },
    ],
    optional: [
      { title: 'Changelog', url: 'https://example.com/changelog' },
    ],
  },
})
```

Links in `sections` and `optional` are emitted exactly as written. `optional` becomes the spec's `## Optional` section, which agents may skip when context is short.

### Per-page markdown (`.html.md`)

Every page that has a configuration (an `llmstxt` export, a `metadata` fallback, or a `pages` entry) is served as markdown at `<route>.html.md`, the root page at `/index.html.md`. The body is the page's config rendered in llms.txt format, including any `sections` the page's `llmstxt` export defines:

```bash
curl https://example.com/pricing.html.md
```

```markdown
# Pricing
> Plans and prices
```

`/docs/index.html.md` resolves to the same page as `/docs.html.md`. Status codes:

| Status | Meaning |
| --- | --- |
| `200` | Markdown body, `Content-Type: text/markdown; charset=utf-8` |
| `400` | Auto-discovery is off and the route is not in `pages` |
| `404` | No page with a configuration matches the route |
| `500` | The page file could not be read or parsed, a custom `generator` returned nothing, or discovery timed out |

### Custom generator

`generator` replaces the built-in markdown rendering for both endpoints. For `/llms.txt` it receives the merged site config (sections already include the discovered pages) and the `pages` entries; for `.html.md` it receives the single page's config.

```typescript
import type { LLMsTxtConfig, LLMsTxtPage } from 'next-llms-txt'

createLLmsTxt({
  defaultConfig: { title: 'My Website' },
  generator: (config: LLMsTxtConfig, pages?: LLMsTxtPage[]) => {
    const lines = [`# ${config.title}`]
    for (const section of config.sections ?? [])
      lines.push('', `## ${section.title}`, ...section.items.map(item => `- [${item.title}](${item.url})`))
    for (const page of pages ?? [])
      lines.push(`- [${page.config?.title}](https://example.com${page.route})`)
    return `${lines.join('\n')}\n`
  },
})
```

This is also the way to link HTML pages instead of their `.html.md` variants: rewrite the item URLs (strip `.html.md`, map `/index` to `/`) before rendering.

### Errors, logging and timeouts

- **Invalid configuration** throws `LLMsTxtConfigError` when `createLLmsTxt` is called, so it fails at startup. A config needs at least one of `defaultConfig.title`, a non-empty `pages` array, or `autoDiscovery` set to `true` or an object.
- **Request failures** return `500` and are passed to `onError` with the original error, and logged with `console.error`.
- **Unparseable page files** are passed to `onError` and logged; `llms.txt` is still served without that page, and the page's `.html.md` answers `500`.
- **Advisories** (metadata fallback used, page without export) go to `console.warn` when `showWarnings` is on, which defaults to `NODE_ENV === 'development'`.
- **Trace logs** use the [`debug`](https://www.npmjs.com/package/debug) package: `DEBUG=next-llms-txt:*`.
- **Timeouts**: `discoveryTimeoutMs` aborts discovery after the given time and answers `500`. Discovery also stops when the request is aborted.

```typescript
createLLmsTxt({
  baseUrl: 'https://example.com',
  autoDiscovery: true,
  showWarnings: false,
  discoveryTimeoutMs: 2000,
  onError: error => logger.error({ err: error }, 'llms.txt failed'),
})
```

## Configuration reference

### `LLMsTxtHandlerConfig`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `baseUrl` | `string` | `http://localhost:${PORT ?? 3000}` | Prefix for the absolute URLs of discovered and `pages` entries. Set it in production. |
| `defaultConfig` | `LLMsTxtConfig` | title `My llms.txt Site`, description `This is my llms.txt generated site.` | Title, description, `sections` and `optional` of `llms.txt`. Fields you set replace the defaults. |
| `autoDiscovery` | `boolean \| AutoDiscoveryConfig` | enabled | Page discovery. `false` turns it off. |
| `pages` | `LLMsTxtPage[]` | none | Pages added by hand; listed under `## Pages` and served at `<route>.html.md`. |
| `generator` | `(config, pages?) => string \| undefined` | built-in | Custom markdown rendering. |
| `cacheControl` | `string \| false` | `public, max-age=3600, s-maxage=3600` | `Cache-Control` of both endpoints; `false` omits the header. |
| `showWarnings` | `boolean` | `NODE_ENV === 'development'` | Log discovery advisories with `console.warn`. |
| `onError` | `(error: unknown) => void` | none | Called for every failure, with the original error. |
| `discoveryTimeoutMs` | `number` | no timeout | Abort discovery after this many milliseconds. |
| `trailingSlash` | `boolean` | `true` | Reserved; currently has no effect. Trailing slashes are always accepted. |

### `AutoDiscoveryConfig`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `appDir` | `string` | `src/app` | App Router directory, relative to `rootDir`. Empty string skips it. |
| `pagesDir` | `string` | `src/pages` | Pages Router directory, relative to `rootDir`. Empty string skips it. |
| `rootDir` | `string` | `process.cwd()` at request time | Project root. |
| `llmstxtExportName` | `string` | `llmstxt` | Name of the named export to read. |
| `extensions` | `readonly string[]` | `['.ts', '.tsx', '.js', '.jsx']` | Page file extensions, in priority order; also used to resolve imports. |

### `LLMsTxtConfig`

| Field | Type | Description |
| --- | --- | --- |
| `title` | `string` | H1 title (required). |
| `description` | `string` | Blockquote under the title. |
| `sections` | `LLMsTxtSection[]` | H2 sections: `{ title, description?, items: LLMsTxtItem[] }`. |
| `optional` | `LLMsTxtItem[]` | Items of the `## Optional` section. |

An `LLMsTxtItem` is `{ title, url, description? }`.

## API reference

### `createLLmsTxt(config)`

Validates the config and returns `{ GET }`, a handler that answers `/llms.txt` and `*.html.md` requests with a `NextResponse`. Any other path is treated as a page request. Throws `LLMsTxtConfigError` for an invalid config.

### `isLLMsTxtPath(pathname)`

Returns `true` for `/llms.txt` and any path ending in `.html.md`. Use it in `proxy.ts` to decide which requests go to the handler.

### Errors

`LLMsTxtError` is the base class; `LLMsTxtConfigError` (invalid config) and `LLMsTxtGenerationError` (generator returned nothing for `/llms.txt`) extend it. All are exported for `instanceof` checks.

### Types

`LLMsTxtHandlerConfig`, `AutoDiscoveryConfig`, `LLMsTxtConfig`, `LLMsTxtSection`, `LLMsTxtItem`, `LLMsTxtPage` and `PageInfo` are exported.

The package is ESM-only and ships `dist/index.mjs` with `dist/index.d.ts`.

## Compatibility

- **Next.js**: 16.x. 15.x may work with manual proxy wiring; not supported.
- **Node.js**: 22+
- **React**: 19.2+
- **TypeScript**: 5.9, 6.x and 7.x. `typescript` is an optional peer dependency; the library never imports it at runtime. The published declarations are type-checked against all three in CI.

TypeScript 6 and 7 also put a floor on Next.js itself, independent of this library:

| TypeScript | Next.js needed |
| --- | --- |
| 5.9 | 16.0+ |
| 6.x | 16.2.2+ |
| 7.x | 16.3.0+, or 16.2.12+ with `experimental.useTypeScriptCli: true` |

TypeScript 7 no longer ships the JavaScript compiler API that older Next.js versions load to type-check and to read `next.config.ts`, so `next build` and `next dev` fail there before this library is involved.

Discovery reads page files from disk, so the handler needs the Node.js runtime (the default for `proxy.ts` in Next.js 16) and access to the source files at runtime.

## Best practices

- Set an absolute `baseUrl` (HTTPS in production); the localhost fallback is meant for development.
- Prefer explicit `llmstxt` exports over the `metadata` fallback; they say what an agent should know, not what a search snippet should say.
- Keep descriptions short (about 120 characters) and factual.
- Treat `llms.txt` as a high-signal index: leave marketing and low-value pages out by not giving them an export.
- Keep `showWarnings` off in production.
- Only public pages belong in `llms.txt`; check what discovery picks up before deploying.

## FAQ

**Does it write files to disk?** No. Both endpoints are generated on request; responses are cacheable via `cacheControl`.

**Why do the links end in `.html.md`?** llmstxt.org recommends linking markdown versions of pages, at the page URL plus `.md` (`index.html.md` for URLs without a file name). The plugin serves exactly those routes. To link HTML pages instead, use a custom `generator`.

**Can I have `/llms.html.md`?** No. `/llms.txt` is the location the specification defines; the `.html.md` convention applies to the pages it links.

**How are duplicates handled?** Each route appears once. A `pages` entry beats a discovered page; an App Router page beats a Pages Router page.

**Can I control section order?** Sections from `defaultConfig.sections` come first, in your order; discovered sections follow in discovery order.

**Can I add items at runtime?** The config is read when `createLLmsTxt` is called. Build it before that, or render dynamic content with a custom `generator`.

## Demo server

The monorepo contains a demo app with routes for every export combination:

```bash
npm run server:demo   # from the repo root, then open http://localhost:3000
```

Try `/llms.txt`, `/all-exports.html.md`, `/metadata-only.html.md`, `/nested/*` and `/full-test`. Hosted version: <https://next-llms-txt-demo-server.vercel.app>.

## Contributing

Contributions are welcome. See the [Contributing Guide](CONTRIBUTING.md) for setup, the test workflow and conventions.

```bash
git clone https://github.com/bke-daniel/next-llms-txt.git
cd next-llms-txt
npm install
npm test
```

## License

MIT, see [LICENSE](LICENSE).

## Support

- 🐛 **Bug reports**: [GitHub Issues](https://github.com/bke-daniel/next-llms-txt/issues)
- 💡 **Feature requests**: [GitHub Discussions](https://github.com/bke-daniel/next-llms-txt/discussions)
- 💬 **Questions**: [GitHub Discussions](https://github.com/bke-daniel/next-llms-txt/discussions/categories/q-a)
