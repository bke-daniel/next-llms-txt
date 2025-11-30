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

LLM-focused content discovery and delivery for **Next.js 16+**. Generates a spec-compliant `llms.txt` plus on-demand raw markdown endpoints (`*.html.md`) for every discoverable page. One function. Zero boilerplate. Production ready.

## Highlights

- ✨ Automated discovery: scan App + Pages routes, emit structured `llms.txt`
- 🚀 Zero setup: a single `createLLmsTxt` call yields `{ GET }`
- 🧠 AI-ready: direct clean markdown endpoints (`/*.html.md`)—no DOM scraping
- 📝 Dual source: prefer `llmstxt` export; fallback to Next.js `metadata`
- 🌐 Absolute URL discipline: predictable ingestion for external agents
- 🎯 Focused spec compliance: tight, minimal, deterministic output
- 🧪 High test coverage: defensive edge cases, stable upgrades
- ⚙️ Proxy-first integration: one matcher handles all relevant paths
- 🔒 Safe defaults: warnings only in dev, no runtime file writes
- 🛠 Customizable: override generator for bespoke markdown formatting

## Contents

- [Introduction](#1-introduction)
- [Features](#2-features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Guides](#guides)
- [API Reference](#api-reference)
- [Best Practices](#10-best-practices)
- [Compatibility](#11-compatibility)
- [FAQ](#12-faq)
- [Contributing](#13-contributing)
- [License](#license)
 - [Demo Server](#demo-server)

## 1. Introduction

LLMs struggle with hydrated React trees, client navigation, and layout noise. The `llms.txt` specification provides a markdown manifest of essential site content plus direct pointers to clean textual representations. `next-llms-txt` automates generation for Next.js 16+: it scans pages, synthesizes structured sections, serves canonical markdown, and exposes per-page raw content via deterministic `.html.md` routes. Result: higher quality ingestion for AI agents, less manual curation.

## 2. Features

- Auto-discovery across App Router and legacy Pages Router
- Unified handler for site-level `llms.txt` + per-page markdown
- Markdown-first content pipeline (no HTML parsing required by consumers)
- Metadata fallback (uses Next.js `metadata` where `llmstxt` export absent)
- Static matcher configuration (proxy-friendly; no dynamic arrays)

### Pattern: Diagnostics Disabled in Production

```typescript
autoDiscovery: { baseUrl: 'https://example.com', showWarnings: false }
```

## 10. Best Practices

- Provide stable absolute `baseUrl` (no relative paths)
- Prefer explicit `llmstxt` export over metadata fallback for clarity
- Keep descriptions concise (<= 120 chars target)
- Avoid empty sections; let discovery filter automatically
- Disable warnings outside development
- Version control generated changes via tests, not runtime patching
- Treat `llms.txt` as high-signal index; exclude low-value marketing fluff

## 11. Compatibility

- **Next.js**: 16.x official. 15.x may work with manual proxy wiring; not supported.
- **Node.js**: 22+
- **React**: 19.2+
- **TypeScript**: 5.9+

## 12. FAQ

**Q: Does it write files to disk?** No. All responses are generated on demand.
**Q: Can I add dynamic runtime items?** Yes—inject them into `defaultConfig.sections` before calling handler.
**Q: How are duplicate items handled?** Last write wins within a section; discovery skips exact duplicates.
**Q: Why not expose HTML?** Raw markdown lowers parsing cost and ambiguity for LLM ingestion.
**Q: Can I customize section ordering?** Provide sections manually; discovered sections append after manual ones.

## 13. Contributing

Fork, branch, implement, test, open PR. Maintain type safety. Preserve public API surface. Add focused tests.

Setup:

```bash
git clone https://github.com/bke-daniel/next-llms-txt.git
cd next-llms-txt
npm install
npm test
```

---

`llms.txt` specification: <https://llmstxt.org>
High coverage ensured; rely on contract rather than internal imports.
No deprecated multi-handler APIs (`createEnhancedLLMsTxtHandlers`, `createLLMsTxtHandlers`, `createPageLLMsTxtHandlers`)—all replaced by `createLLmsTxt`.

1. **`llmstxt` Export (Preferred)**: Provide explicit title and description for maximum clarity.

```typescript
// app/about/page.tsx
export const llmstxt = {
  title: 'About Our Company',
  description: 'Learn about our mission and values.'
};
```

1. **`metadata` Export (Fallback)**: If no `llmstxt` object is found, the library will use your existing Next.js `metadata` export as a fallback.

```typescript
// app/about/page.tsx
export const metadata = {
  title: 'About Us', // Used as the llms.txt title
  description: 'Our company history.' // Used as the llms.txt description
};
```

### 3. URL Resolution and `.html.md`

LLMs prefer raw text over parsing complex HTML. `next-llms-txt` facilitates this with a special convention:

- A page at the URL `/services/consulting` can have its raw content defined in a file at `/services/consulting.html.md`.
- The library's `createPageLLMsTxtHandlers` creates a special API route that can serve the content of these `.html.md` files.
- The auto-discovery system automatically finds these `.html.md` files and maps them to the correct web URL. This means a request to `/services/consulting` can be resolved to the content in `/services/consulting.html.md`.

This allows you to provide clean, structured text to LLMs without affecting your user-facing pages.

## Quick Start

Get up and running in 30 seconds.

1. **Install the package:**

    ```bash
    npm install next-llms-txt
    ```

## Demo Server

Explore a live set of routes showcasing auto-discovery, per-page markdown, and different export combinations in the monorepo demo server.

- Start from the repo root:

    ```bash
    npm run server:demo
    ```

- Open `http://localhost:3000` and try:
  - `/llms.txt` — root manifest generated via auto-discovery
  - `/*.html.md` — page-specific raw markdown endpoints
  - `/all-exports`, `/metadata-only`, `/llms-txt-only`, `/no-exports`
  - Nested variants under `/nested/*`
  - `/full-test` — comprehensive configuration
  - `/with-proxy` — explains proxy setup for `.html.md`

Hosted demo (auto-updated via Vercel):

- Production: https://next-llms-txt-demo-server.vercel.app
- Note: The demo-server is deployed automatically on every push to this repo. Use it to preview the latest library behavior without running locally.

Key files in the demo:
- `packages/demo-server/src/app/llms.txt/route.ts` — Node.js route using `createLLmsTxt`
- `packages/demo-server/src/proxy.ts` — edge proxy rewriting `*.html.md` to a Node API
- `packages/demo-server/src/app/api/llms-md/route.ts` — Node API generating markdown
- `packages/demo-server/src/llms-txt-config.ts` — demo config used by the handlers

2. **Add proxy integration in `src/proxy.ts`:**

    ```typescript
    // src/proxy.ts
    import type { NextRequest } from 'next/server'
    import { NextResponse } from 'next/server'
    import { createLLmsTxt, isLLMsTxtPath } from 'next-llms-txt'

    const { GET: handleLLmsTxt } = createLLmsTxt({
      baseUrl: 'http://localhost:3000',
      autoDiscovery: {
        baseUrl: 'http://localhost:3000',
        appDir: 'src/app',
      },
    })

    export default async function proxy(request: NextRequest) {
      const { pathname } = request.nextUrl
      if (isLLMsTxtPath(pathname)) {
        return await handleLLmsTxt(request)
      }
      return NextResponse.next()
    }

    export const config = {
      matcher: ['/llms.txt', '/:path*.html.md']
    }
    ```

3. **Add content sources to your pages:**

    Export a `llmstxt` object (recommended) or use Next.js `metadata` as fallback in your page files:

    ```typescript
    // src/app/services/page.tsx
    export const llmstxt = {
      title: 'Our Services',
      description: 'Explore the professional services we offer.'
    }
    // or
    export const metadata = {
      title: 'Our Services',
      description: 'Explore the professional services we offer.'
    }
    ```

4. **Add llms.txt route handler:**

    ```typescript
    // src/app/llms.txt/route.ts
    import { createLLmsTxt } from 'next-llms-txt'

    export const { GET } = createLLmsTxt({
      baseUrl: 'https://example.com',
      defaultConfig: {
        title: 'Next.js next-llms-txt is awesome!',
        description: 'A comprehensive toolkit for generating LLM-optimized documentation',
      },
      autoDiscovery: {
        baseUrl: 'https://example.com',
      },
    })
    ```

5. **Start your development server** and visit `http://localhost:3000/llms.txt`.

## Installation

```bash
# npm
npm install next-llms-txt

# yarn
yarn add next-llms-txt

# pnpm
pnpm add next-llms-txt

# bun
bun add next-llms-txt
```

## Guides

Follow these guides to implement `next-llms-txt` in your project.

### 1. Basic Manual Setup

This approach gives you full control by letting you define the `llms.txt` content manually. It's perfect for smaller sites or when you want to be explicit.

**Create `app/llms.txt/route.ts`:**

```typescript
import { createLLmsTxt } from 'next-llms-txt';

export const { GET } = createLLmsTxt({
  baseUrl: 'https://example.com',
  defaultConfig: {
    title: 'My Awesome Project',
    description: 'A comprehensive toolkit for developers.',
    sections: [
    {
      title: 'Documentation',
      items: [
        {
          title: 'Getting Started',
          url: 'https://example.com/docs/getting-started',
          description: 'A quick introduction for new users.'
        },
        {
          title: 'API Reference',
          url: 'https://example.com/docs/api',
          description: 'Complete API documentation for the project.'
        }
      ]
    }
  ],
  },
});
```

### 2. Auto-Discovery Setup

Let `next-llms-txt` automatically scan your project and build the `llms.txt` file from your pages.

**Step 1: Add content sources to your pages.**

In each page you want to include (e.g., `app/services/page.tsx`), export a `llmstxt` or `metadata` object.

```typescript
// app/services/page.tsx
import type { Metadata } from 'next';

// Provide an llmstxt export (recommended)
export const llmstxt = {
  title: 'Our Services',
  description: 'Explore the professional services we offer.'
};

// Or, the library can use your existing metadata as a fallback
export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Explore the professional services we offer.'
};

export default function ServicesPage() {
  return <div>Our Services</div>;
}
```

**Step 2: Create the route handler with auto-discovery.**

```typescript
// app/llms.txt/route.ts
import { createLLmsTxt } from 'next-llms-txt';

export const { GET } = createLLmsTxt({
  baseUrl: 'https://example.com',
  defaultConfig: {
    title: 'My Website',
    description: 'Automatically discovered content from my Next.js pages.',
  },
  autoDiscovery: {
    baseUrl: 'https://example.com',
  },
});
```

The handler will now automatically find your pages and generate the `llms.txt` file.

### 3. Per-Page Content with `.html.md`

To provide raw markdown content for specific pages, create `.html.md` files. The middleware automatically serves this content when LLMs request it.

**Step 1: Create your markdown content files.**

Place a markdown file next to your page, naming it with the `.html.md` extension.

```text
/src/app
  /services
    /consulting
      page.tsx
      page.html.md  <-- Markdown content for the /services/consulting page
```

**Step 2: Configure proxy to handle `.html.md` requests.**

The proxy integration from the Quick Start already handles this:

```typescript
// src/proxy.ts
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Handles both /llms.txt and /*.html.md paths
  if (isLLMsTxtPath(pathname)) {
    return await handleLLmsTxt(request)
  }
  return NextResponse.next()
}
```

Now, when an LLM sees a URL like `https://example.com/services/consulting` in your main `llms.txt`, it can request the content from your API route, which will serve the text from `page.html.md`.

## API Reference

### Core Functions

#### `createLLmsTxt(config)`

Unified handler factory returning `{ GET }` for `/llms.txt` and `.html.md` content endpoints.

```typescript
import { createLLmsTxt, isLLMsTxtPath } from 'next-llms-txt';

const { GET } = createLLmsTxt({
  baseUrl: 'https://example.com',
  defaultConfig: {
    title: 'My Site',
    description: 'Documentation and reference'
  },
  autoDiscovery: { baseUrl: 'https://example.com' }
});
```

#### `isLLMsTxtPath(pathname)`

Predicate utility to route requests for `/llms.txt` and any `*.html.md` content pages.

```typescript
if (isLLMsTxtPath(request.nextUrl.pathname)) {
  return await GET(request);
}
```

#### `createPageLLMsTxtHandlers(baseUrl, config?)`

Creates a handler for serving per-page content from `.html.md` files. Typically used in a dynamic API route.

```typescript
import { createPageLLMsTxtHandlers } from 'next-llms-txt';

const { GET } = createPageLLMsTxtHandlers('https://example.com', {
  autoDiscovery: { baseUrl: 'https://example.com' }
});
```

### Type Definitions

The library is written in TypeScript and exports all types for a fully typed experience.

- `LLMsTxtConfig`: The main configuration object for `llms.txt` content.
- `LLMsTxtSection`: A section within the `llms.txt` file, containing a title and items.
- `LLMsTxtItem`: An individual link, with a title, URL, and optional description.
- `AutoDiscoveryConfig`: Configuration for the auto-discovery system.
- `LLMsTxtHandlerConfig`: Main configuration object for the `createLLmsTxt` function.

## Best Practices

- **Use Absolute URLs**: Always provide a `baseUrl` in your configuration to ensure all generated URLs are absolute, as required by the `llms.txt` standard.
- **Prefer `llmstxt` Exports**: While the `metadata` fallback is convenient, using an explicit `llmstxt` export gives you more control and makes your intent clear.
- **Keep Descriptions Concise**: Write clear and concise descriptions for your pages and sections. Think about what an LLM would need to understand the content.
- **Use Proxy**: The proxy approach provides the most flexibility for handling both `/llms.txt` and `.html.md` requests in a single location.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to set up the development environment, run tests, and submit your changes.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/bke-daniel/next-llms-txt.git
cd next-llms-txt

# Install dependencies
npm install

# Run tests
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/bke-daniel/next-llms-txt/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/bke-daniel/next-llms-txt/discussions)
- 💬 **Questions**: [GitHub Discussions](https://github.com/bke-daniel/next-llms-txt/discussions/categories/q-a)

---

**next-llms-txt** - Making AI-friendly documentation effortless in Next.js

Built with ❤️ by the open source community

`llms.txt` is a markdown file that helps AI agents like ChatGPT and Claude understand your website structure and find key resources. It follows the [llmstxt.org specification](https://llmstxt.org) with a standardized format that's easy for both humans and LLMs to read.

yarn add next-llms-txt
autoDiscovery: {
autoDiscovery: {
git clone <https://github.com/yourusername/next-llms-txt.git>
