# Update & upgrade guide

This guide takes an existing project to **next-llms-txt 2.1**. Pick your starting point:

- [Update from 2.0 to 2.1](#update-from-20-to-21): a minor release, usually done in a few minutes
- [Upgrade from 1.x to 2.1](#upgrade-from-1x-to-21): a major upgrade with breaking changes

The complete list of changes is in the [changelog](./CHANGELOG.md).

```bash
npm install next-llms-txt@^2.1.0
```

## Update from 2.0 to 2.1

### What changed

**List items in `llms.txt` link to the markdown variant of each page instead of the HTML page.** This follows llmstxt.org, which links the `.md` versions of pages. For example, with `baseUrl: 'https://example.com'`:

```diff
 ## Main Pages
-- [Home](https://example.com/): Welcome
-- [Pricing](https://example.com/pricing): Plans and prices
+- [Home](https://example.com/index.html.md): Welcome
+- [Pricing](https://example.com/pricing.html.md): Plans and prices

 ## Docs
-- [Getting Started](https://example.com/docs/getting-started)
+- [Getting Started](https://example.com/docs/getting-started.html.md)
```

- Applies to discovered pages and to entries passed through `pages` (`## Pages` block).
- Does **not** apply to items you write yourself in `defaultConfig.sections` or `defaultConfig.optional`; those are emitted exactly as written.
- The root page is linked as `/index.html.md`.

**Entries passed through `pages` are now served at `<route>.html.md`.** In 2.0 the per-page handler only knew discovered pages, so a `pages` entry answered `404` there (or `400` with discovery off). Now:

- a `pages` entry is served at its `.html.md` route, also with `autoDiscovery: false`;
- it wins over a discovered page with the same route, as it already did in `llms.txt`;
- `400` is only returned when discovery is off **and** the route has no `pages` entry.

The public API and types are unchanged.

### Checklist

**1. Make sure `*.html.md` requests reach the handler.** The new links only work if the handler answers them. Look for the matcher in your `proxy.ts`:

```typescript
export const config = {
  matcher: ['/llms.txt', '/:path*.html.md'],
}
```

If you serve `/llms.txt` through a route handler alone (`app/llms.txt/route.ts`), the new links answer `404`. Choose one fix:

- **Recommended: move to `proxy.ts`.** See the [Quick Start](./README.md#quick-start). Delete `app/llms.txt/route.ts` afterwards; the proxy answers `/llms.txt` first anyway.
- **Only manual links:** set `autoDiscovery: false` and don't use `pages`. Then `llms.txt` contains only your own `sections` and `optional` links, and a route handler is enough.
- **Keep HTML links:** pass the [generator below](#keeping-html-links).

> **Auto-discovery is on unless you set `autoDiscovery: false`.** A route handler with only `defaultConfig.sections` and no `autoDiscovery` key still lists discovered pages, and from 2.1 on those links end in `.html.md`. If you meant to list only your own links, add `autoDiscovery: false`.

**2. Check the result.** After deploying, every link in `llms.txt` should answer `200` with `text/markdown`:

```bash
BASE=https://example.com
curl -s "$BASE/llms.txt" \
  | grep -oE '\]\([^)]+\.html\.md\)' | tr -d '])(' \
  | while read -r url; do
      echo "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$url") $url"
    done
```

**3. Update tests and snapshots** that assert on the URLs in `llms.txt`: discovered and `pages` URLs now end in `.html.md`, and `/` becomes `/index.html.md`.

**4. Custom `generator`.** The site config it receives contains the discovered items with their new `.html.md` URLs. `pages` entries are still passed as `{ route, config }`; build their URLs as you did before.

**5. Status codes of `.html.md` for `pages` entries.** If anything relied on a `pages` route answering `404`, or on `400` for every request while discovery is off, it now gets `200` for those routes.

### Keeping HTML links

If your agents or tooling need the HTML URLs, render the output yourself. This generator reproduces the built-in format with HTML links:

```typescript
import type { LLMsTxtConfig, LLMsTxtItem, LLMsTxtPage } from 'next-llms-txt'

const BASE_URL = 'https://example.com'

// `/index.html.md` → `/`, `/pricing.html.md` → `/pricing`
const toHtmlUrl = (url: string) => url.replace(/\/index\.html\.md$/, '/').replace(/\.html\.md$/, '')
const item = ({ title, url, description }: LLMsTxtItem) =>
  `- [${title}](${url})${description ? `: ${description}` : ''}`

export function htmlLinkGenerator(config: LLMsTxtConfig, pages: LLMsTxtPage[] = []): string {
  const blocks = [[`# ${config.title}`, ...(config.description ? [`> ${config.description}`] : [])].join('\n')]

  const pageItems = pages
    .filter(page => page.config?.title)
    .map(page => item({ title: page.config!.title, url: `${BASE_URL}${page.route}`, description: page.config!.description }))
  if (pageItems.length > 0)
    blocks.push(['## Pages', ...pageItems].join('\n'))

  for (const section of config.sections ?? []) {
    if (section.items.length > 0)
      blocks.push([`## ${section.title}`, ...section.items.map(i => item({ ...i, url: toHtmlUrl(i.url) }))].join('\n'))
  }

  if (config.optional?.length)
    blocks.push(['## Optional', ...config.optional.map(item)].join('\n'))

  return `${blocks.join('\n\n')}\n`
}
```

```typescript
createLLmsTxt({
  baseUrl: 'https://example.com',
  defaultConfig: { title: 'My Website' },
  autoDiscovery: true,
  generator: htmlLinkGenerator,
})
```

The generator also renders the `.html.md` responses, which have no `pages` argument; the output for them stays the same. `toHtmlUrl` also rewrites links you wrote yourself in `sections` if they end in `.html.md`.

## Upgrade from 1.x to 2.1

Upgrade straight to 2.1; there is no need to stop at 2.0. Most projects need steps 1 to 4.

**1. Check your runtime.** 2.x needs Node.js 22 or newer and Next.js 16, and supports TypeScript 5.9, 6.x and 7.x. TypeScript 6 and 7 also put a floor on Next.js itself; see [Compatibility](./README.md#compatibility).

**2. Serve both endpoints from `createLLmsTxt` in `proxy.ts`.** Since 2.1 the links in `llms.txt` point at `.html.md` routes, so the handler has to answer them; wire it up as in the [Quick Start](./README.md#quick-start). If you still call a pre-1.0 helper (`createLLMsTxtHandlers`, `createEnhancedLLMsTxtHandlers`, `createPageLLMsTxtHandlers`), replace it with `createLLmsTxt`; those were removed from the public API in 1.0. Older examples in this repository nested `baseUrl` and `showWarnings` inside `autoDiscovery`; they belong at the top level, and the 2.x types reject them inside `autoDiscovery`:

```diff
 createLLmsTxt({
+  baseUrl: 'https://example.com',
+  showWarnings: true,
   autoDiscovery: {
-    baseUrl: 'https://example.com',
-    showWarnings: true,
     appDir: 'src/app',
   },
 })
```

**3. Make sure the config passes validation.** `createLLmsTxt` validates when it is called, so a bad config fails at startup instead of on the first request. It throws `LLMsTxtConfigError` unless the config has at least one of:

- `defaultConfig.title`
- a non-empty `pages` array
- `autoDiscovery` set to `true` or to an object

```typescript
import { createLLmsTxt, LLMsTxtConfigError } from 'next-llms-txt'

try {
  createLLmsTxt({ autoDiscovery: false }) // nothing to generate from
}
catch (error) {
  if (error instanceof LLMsTxtConfigError) {
    // fix the config
  }
}
```

**4. Review your generated `llms.txt`.** The output changed; diff it once after upgrading:

- Discovered pages are grouped into sections: root-level routes under `Main Pages`, deeper routes by their first path segment. 1.x used a single bucket.
- Each route appears once. A page passed through `pages` replaces a discovered page with the same route.
- `## Pages` only lists pages passed through `pages`.
- Discovered and `pages` items link to the absolute markdown variant (`baseUrl` + `route` + `.html.md`, the root as `/index.html.md`). 1.x linked the HTML page, and emitted `pages` entries as bare routes. To keep HTML links, see [Keeping HTML links](#keeping-html-links).
- Files in `src/pages` (Pages Router) are discovered by default. Point `autoDiscovery.pagesDir` elsewhere, or set it to `''`, if you don't want them.
- Pages inside route groups such as `app/(marketing)/about/page.tsx` are listed, at `/about`. 1.x skipped them.

**5. `autoDiscovery: false` is respected.** 1.x silently re-enabled discovery. With it off, `.html.md` requests answer `400` unless the route is in `pages`.

**6. If you use a custom `generator`,** its second argument is `LLMsTxtPage[]` (`route` and `config`) instead of the internal `PageInfo[]`. `filePath`, `hasLLMsTxtExport`, `hasMetadataFallback` and `warnings` are no longer passed.

```typescript
import type { LLMsTxtConfig, LLMsTxtPage } from 'next-llms-txt'

function generator(config: LLMsTxtConfig, pages?: LLMsTxtPage[]) {
  return `# ${config.title}\n\n${(pages ?? []).map(page => `- ${page.route}`).join('\n')}\n`
}
```

**7. If you rely on status codes of `*.html.md`:** `400` means auto-discovery is off and the route is not in `pages`, `404` means no page matched, and `500` means the page file could not be parsed (was `404`) or a custom `generator` returned nothing (was `400`).

**8. If you read the discovery logs,** they moved from `console.log` to the `debug` package. Run with `DEBUG=next-llms-txt:*`. Advisories controlled by `showWarnings` still go to `console.warn`. Failures are new in production output: a page that cannot be parsed is logged with `console.error` and passed to `onError`, and a configuration whose discovery directories do not exist is warned about, whatever `showWarnings` says.

**9. CommonJS.** The package is ESM-only. `require('next-llms-txt')` did not work in 1.x either, because the `require` export pointed at a file that was never built; it now fails with Node's ESM-only error. Use `import`.

**10. Then run the [2.0 → 2.1 checklist](#checklist)** to verify that every link answers `200`.
