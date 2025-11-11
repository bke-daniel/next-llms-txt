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

<p align="center">
  <strong>The complete Next.js toolkit for generating LLM-optimized documentation.</strong>
</p>

<p style="color: red">This is package is WIP, but it's working as expected already. Help is highly appreciated.</p>

<p align="center">
  Automatically generate <a href="https://llmstxt.org">llms.txt</a> files to make your website more accessible to Large Language Models like ChatGPT, Claude, and Gemini.
</p>

---

## Table of Contents

- [Why next-llms-txt?](#why-next-llms-txt)
- [Core Concepts](#core-concepts)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Guides](#guides)
  - [1. Basic Manual Setup](#1-basic-manual-setup)
  - [2. Auto-Discovery Setup](#2-auto-discovery-setup)
  - [3. Per-Page Content with `.html.md`](#3-per-page-content-with-htmlmd)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)

## Why next-llms-txt?

Modern web applications built with frameworks like Next.js often rely on client-side rendering and complex component structures. This can make it difficult for Large Language Models (LLMs) to parse and understand the core content of a website.

The `llms.txt` standard solves this by providing a structured markdown file that acts as a sitemap for AI. `next-llms-txt` is the definitive tool for integrating this standard into any Next.js project, offering a seamless developer experience with powerful features.

- ✨ **Automated Content Discovery**: Scans your project to find pages and automatically generates `llms.txt` entries.
- 🚀 **Zero-Configuration by Default**: Works out of the box with sensible defaults for any Next.js project.
- 🔄 **Universal Next.js Support**: Native integration with both App Router and Pages Router.
- 📝 **Flexible Content Sources**: Define `llms.txt` content by exporting a `llmstxt` object from your pages or let the library fall back to your existing Next.js `metadata` exports.
- 🌐 **Advanced URL Resolution**: Intelligently maps web routes like `/services/consulting` or `/about.html` to their corresponding content files, including `.html.md` for raw text access.
- 🎨 **Fully Customizable**: Override the default behavior with custom configurations and content generators.
- 🧪 **Reliable and Tested**: A comprehensive test suite ensures correctness and stability.

## Core Concepts

Understanding these concepts will help you get the most out of `next-llms-txt`.

### 1. Auto-Discovery

The most powerful feature of `next-llms-txt`. When enabled, the library scans your `src/app` or `src/pages` directories to find all discoverable pages. It then builds a complete `llms.txt` file based on the content it finds.

### 2. Content Sources

For auto-discovery to work, pages must provide content information. The library looks for one of two sources in your page files (e.g., `page.tsx`):

1. **`llmstxt` Export (Recommended)**: An explicit `llmstxt` object that gives you full control over the title and description.

    ```typescript
    // app/about/page.tsx
    export const llmstxt = {
      title: 'About Our Company',
      description: 'Learn about our mission and values.'
    };
    ```

2. **`metadata` Export (Fallback)**: If no `llmstxt` object is found, the library will use your existing Next.js `metadata` export as a fallback.

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

2. **Add middleware-first integration in `src/proxy.ts`:**

    ```typescript
    // src/middleware.ts
    import type { NextRequest } from 'next/server'
    import { NextResponse } from 'next/server'
    import { createLLmsTxt } from '@/code-version'

    const { GET: handleLLmsTxt } = createLLmsTxt({
      baseUrl: 'http://localhost:3000',
      autoDiscovery: {
        baseUrl: 'http://localhost:3000',
        appDir: 'app', // must be set in our case because there's no src dir
      },
    })

    export default async function middleware(request: NextRequest) {
      const { pathname } = request.nextUrl
      if (pathname === '/llms.txt' || pathname.endsWith('.html.md')) {
        return await handleLLmsTxt(request)
      }
      return NextResponse.next()
    }

    export const config = {
      matcher: ['/llms.txt', '/:path*.html.md'],
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

5. **Add llms.txt to your app folder:**

    ```typescript
    // src/app/llms.txt/route.ts
    import { createLLmsTxt } from '@/code-version'

    export const { GET } = createLLmsTxt({
      title: 'Next.js next-llms-txt is awesome!',
      // Enable auto-discovery
      autoDiscovery: {
        baseUrl: 'https://example.com', // Required for generating absolute URLs
      },
    })

    ```

6. **Start your development server** and visit `http://localhost:3000/llms.txt`.

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
<p style="color: red;">Everything below here is deprecated and needs to be updated.</p>

### 1. Basic Manual Setup

This approach gives you full control by letting you define the `llms.txt` content manually. It's perfect for smaller sites or when you want to be explicit.

**Create `app/llms.txt/route.ts`:**

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt';

export const { GET } = createLLMsTxtHandlers({
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
  ]
});
```

### 2. Auto-Discovery Setup

Let `next-llms-txt` do the heavy lifting. This setup automatically scans your project and builds the `llms.txt` file from your pages.

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

**Step 2: Create the enhanced route handler.**

Use `createEnhancedLLMsTxtHandlers` to enable auto-discovery.

```typescript
// app/llms.txt/route.ts
import { createEnhancedLLMsTxtHandlers } from 'next-llms-txt';

export const { GET } = createEnhancedLLMsTxtHandlers({
  // You can still provide a main title and description
  title: 'My Website',
  description: 'Automatically discovered content from my Next.js pages.',

  // Enable auto-discovery
  autoDiscovery: {
    baseUrl: 'https://example.com' // Required for generating absolute URLs
  }
});
```

The handler will now automatically find your pages and generate the `llms.txt` file.

### 3. Per-Page Content with `.html.md`

To provide raw markdown content for specific pages, you can create `.html.md` files. The `createPageLLMsTxtHandlers` function creates a special API route to serve this content.

**Step 1: Create your markdown content files.**

Place a markdown file next to your page, naming it with the `.html.md` extension.

```
/src/app
  /services
    /consulting
      page.tsx
      page.html.md  <-- Markdown content for the /services/consulting page
```

**Step 2: Create a dynamic API route to serve the content.**

This route will catch requests for your pages and serve the corresponding markdown.

```typescript
// app/api/llms-txt/[...slug]/route.ts
import { createPageLLMsTxtHandlers } from 'next-llms-txt';

// This handler serves the content of .html.md files
export const { GET } = createPageLLMsTxtHandlers('https://example.com', {
  autoDiscovery: {
    baseUrl: 'https://example.com'
  }
});
```

Now, when an LLM sees a URL like `https://example.com/services/consulting` in your main `llms.txt`, it can request the content from your API route, which will serve the text from `page.html.md`.

## API Reference

### Core Functions

#### `createLLMsTxtHandlers(config)`

Creates a basic `llms.txt` handler for manual configuration.

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt';

const { GET } = createLLMsTxtHandlers({
  title: 'My Site',
  description: 'Site description',
  sections: [/* ... */]
});
```

#### `createEnhancedLLMsTxtHandlers(config)`

Creates an advanced handler with auto-discovery capabilities.

```typescript
import { createEnhancedLLMsTxtHandlers } from 'next-llms-txt';

const { GET } = createEnhancedLLMsTxtHandlers({
  title: 'My Site',
  autoDiscovery: {
    baseUrl: 'https://example.com',
    appDir: 'src/app',      // Default: 'src/app'
    pagesDir: 'src/pages',  // Default: 'src/pages'
  }
});
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
- `EnhancedHandlerConfig`: Configuration for the enhanced handlers, including auto-discovery settings.

## Best Practices

- **Use Absolute URLs**: Always provide a `baseUrl` in your configuration to ensure all generated URLs are absolute, as required by the `llms.txt` standard.
- **Prefer `llmstxt` Exports**: While the `metadata` fallback is convenient, using an explicit `llmstxt` export gives you more control and makes your intent clear.
- **Keep Descriptions Concise**: Write clear and concise descriptions for your pages and sections. Think about what an LLM would need to understand the content.
- **Disable Warnings in Production**: In your `autoDiscovery` config, set `showWarnings: false` for production builds to avoid polluting logs.

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

<div align="center">
  <strong>next-llms-txt</strong> - Making AI-friendly documentation effortless in Next.js
  <br/>
  <sub>Built with ❤️ by the open source community</sub>
</div>

---

## Table of Contents

- [What is llms.txt?](#what-is-llmstxt)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Setup](#basic-setup)
  - [Auto-Discovery Mode](#auto-discovery-mode)
  - [Enhanced Handlers](#enhanced-handlers)
  - [Per-Page Configuration](#per-page-configuration)
- [API Reference](#api-reference)
- [Advanced Features](#advanced-features)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## What is llms.txt?

`llms.txt` is a markdown file that helps AI agents like ChatGPT and Claude understand your website structure and find key resources. It follows the [llmstxt.org specification](https://llmstxt.org) with a standardized format that's easy for both humans and LLMs to read.

Think of it as a sitemap for AI - it tells language models what your website contains and where to find important information.

The key difference is that `llms.txt` can point to markdown files that represent the content of a page, rather than the page itself. For example, for a page at `/services/consulting`, the `llms.txt` file can point to `/services/consulting.html.md`, which is a markdown representation of the page's content. This allows LLMs to get the raw text content of a page without having to parse HTML and JavaScript.

This library handles all of this for you, including the automatic generation of these `.html.md` files.

## Features

- ✨ **Auto-Discovery**: Automatically scan your Next.js app and generate llms.txt from your pages
- 🚀 **Zero Config**: Works out of the box with sensible defaults
- 🔄 **Next.js Integration**: Native support for App Router and Pages Router
- 📝 **Spec Compliant**: Follows the official [llmstxt.org specification](https://llmstxt.org)
- 🎯 **Multiple Modes**: Manual configuration, auto-discovery, or hybrid approach
- � **TypeScript First**: Full type safety with IntelliSense support
- 🌐 **Flexible URLs**: Support for `.html.md` endpoints and trailing slash variations
- ⚠️ **Developer Friendly**: Built-in warnings and validation during development
- 🎨 **Customizable**: Custom generators and advanced configuration options
- 📦 **Universal**: Supports both ESM and CommonJS
- 🧪 **Well Tested**: 50+ tests ensuring reliability and correctness

## Quick Start

Get up and running in 30 seconds:

```bash
npm install next-llms-txt
```

Create `app/llms.txt/route.ts`:

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createLLMsTxtHandlers({
  title: 'My Website',
  description: 'Learn about my awesome project',
  sections: [{
    title: 'Documentation',
    items: [{
      title: 'Getting Started',
      url: '/docs',
      description: 'Everything you need to know'
    }]
  }]
})
```

Visit `http://localhost:3000/llms.txt` - that's it! 🎉

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

## Usage

### Basic Setup

The simplest approach - manually configure your llms.txt content:

**Step 1:** Create `lib/llmstxt.ts`:

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createLLMsTxtHandlers({
  title: 'My Awesome Project',
  description: 'A comprehensive toolkit for developers',
  sections: [
    {
      title: 'Documentation',
      items: [
        {
          title: 'Getting Started',
          url: '/docs/getting-started',
          description: 'Quick intro for new users'
        },
        {
          title: 'API Reference',
          url: '/docs/api',
          description: 'Complete API documentation'
        }
      ]
    },
    {
      title: 'Examples',
      items: [
        {
          title: 'Basic Example',
          url: '/examples/basic',
          description: 'Simple example to get started'
        }
      ]
    }
  ]
})
```

**Step 2:** Create `app/llms.txt/route.ts`:

```typescript
import { GET } from '@/lib/llmstxt'

export { GET }
```

**Result:** Visit `/llms.txt` to see your generated file!

### Auto-Discovery Mode

Let next-llms-txt automatically scan your app and build the llms.txt from your pages:

```typescript
import { createEnhancedLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createEnhancedLLMsTxtHandlers({
  title: 'My Website',
  description: 'Automatically discovered content',
  autoDiscovery: {
    baseUrl: 'https://mysite.com',
    // Scans src/app and src/pages by default
  }
})
```

**How it works:**

1. Scans your `src/app` and `src/pages` directories
2. Looks for pages with `llmstxt` exports
3. Automatically generates sections and links
4. Provides warnings for missing configurations

### Enhanced Handlers

Use enhanced handlers for advanced URL patterns and per-page llms.txt files:

```typescript
// Site-wide llms.txt with auto-discovery
import { createEnhancedLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createEnhancedLLMsTxtHandlers({
  title: 'My Site',
  autoDiscovery: true, // Uses sensible defaults
})
```

```typescript
// Per-page llms.txt (supports /page.html.md URLs)
import { createPageLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createPageLLMsTxtHandlers('https://mysite.com', {
  autoDiscovery: {
    baseUrl: 'https://mysite.com'
  }
})
```

### Per-Page Configuration

Add llms.txt configuration directly to your pages:

```typescript
// app/docs/page.tsx
import type { LLMsTxtConfig } from 'next-llms-txt'

// Export your llms.txt config
export const llmstxt: LLMsTxtConfig = {
  title: 'Documentation',
  description: 'Complete guide to using our platform'
}

export default function DocsPage() {
  return <div>Your page content</div>
}
```

When using auto-discovery, this page will be automatically included in your site's llms.txt!

## API Reference

### Core Functions

#### `createLLMsTxtHandlers(config)`

Creates basic llms.txt handlers for manual configuration.

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt'

const { GET } = createLLMsTxtHandlers({
  title: 'My Site',
  description: 'Site description',
  sections: [/* sections */]
})
```

#### `createEnhancedLLMsTxtHandlers(config)`

Creates enhanced handlers with auto-discovery support.

```typescript
import { createEnhancedLLMsTxtHandlers } from 'next-llms-txt'

const { GET } = createEnhancedLLMsTxtHandlers({
  title: 'My Site',
  autoDiscovery: {
    baseUrl: 'https://example.com',
    appDir: 'src/app',      // Default: 'src/app'
    pagesDir: 'src/pages',  // Default: 'src/pages'
    rootDir: process.cwd(), // Default: process.cwd()
    showWarnings: true      // Default: true in development
  }
})
```

#### `createPageLLMsTxtHandlers(baseUrl, config?)`

Creates handlers for individual page llms.txt files with `.html.md` support.

```typescript
import { createPageLLMsTxtHandlers } from 'next-llms-txt'

const { GET } = createPageLLMsTxtHandlers('https://example.com', {
  autoDiscovery: { baseUrl: 'https://example.com' },
  trailingSlash: true // Handle /page/ and /page variations
})
```

### Type Definitions

#### `LLMsTxtConfig`

Main configuration for llms.txt content:

```typescript
interface LLMsTxtConfig {
  /** Page title (required) - becomes H1 header */
  title: string

  /** Page description (optional) - becomes blockquote */
  description?: string

  /** Organized sections of links */
  sections?: LLMsTxtSection[]
}
```

#### `LLMsTxtSection`

Section within the llms.txt file:

```typescript
interface LLMsTxtSection {
  /** Section title - becomes H2 header */
  title: string

  /** List of links in this section */
  items: LLMsTxtItem[]
}
```

#### `LLMsTxtItem`

Individual link item:

```typescript
interface LLMsTxtItem {
  /** Link text */
  title: string

  /** Link URL */
  url: string

  /** Optional description */
  description?: string
}
```

#### `AutoDiscoveryConfig`

Configuration for automatic page discovery:

```typescript
interface AutoDiscoveryConfig {
  /** Base URL for your site (required) */
  baseUrl: string

  /** App Router directory (optional) */
  appDir?: string

  /** Pages Router directory (optional) */
  pagesDir?: string

  /** Project root directory (optional) */
  rootDir?: string

  /** Show development warnings (optional) */
  showWarnings?: boolean
}
```

#### `EnhancedHandlerConfig`

Advanced configuration with auto-discovery:

```typescript
interface EnhancedHandlerConfig extends LLMsTxtHandlerConfig {
  /** Enable auto-discovery */
  autoDiscovery?: boolean | AutoDiscoveryConfig

  /** Handle trailing slash variations */
  trailingSlash?: boolean
}
```

## Advanced Features

### Auto-Discovery System

The auto-discovery system scans your Next.js project to automatically generate comprehensive llms.txt content:

```typescript
// Full auto-discovery configuration
const { GET } = createEnhancedLLMsTxtHandlers({
  title: 'My Documentation Site',
  description: 'Comprehensive project documentation',
  autoDiscovery: {
    baseUrl: 'https://docs.example.com',
    appDir: 'src/app',
    pagesDir: 'src/pages',
    rootDir: process.cwd(),
    showWarnings: true
  }
})
```

**Features:**

- Scans both App Router (`src/app`) and Pages Router (`src/pages`)
- Finds all page components and API routes
- Generates organized sections (Pages, API Routes, Documentation)
- Handles dynamic routes like `[id]` and `[...slug]`
- Excludes internal Next.js files (_app,_document, etc.)
- Shows helpful warnings in development

### Multiple Router Support

Supports both Next.js routing patterns:

```
Project Structure:
├── src/app/              ← App Router (Next.js 13+)
│   ├── page.tsx          → /
│   ├── about/page.tsx    → /about
│   └── docs/[id]/page.tsx → /docs/[id]
└── src/pages/            ← Pages Router (Legacy)
    ├── index.tsx         → /
    ├── contact.tsx       → /contact
    └── api/users.ts      → /api/users
```

### Enhanced URL Handling

**Trailing Slash Support:**

```typescript
// Handles both /page and /page/ URLs
const { GET } = createPageLLMsTxtHandlers(baseUrl, {
  trailingSlash: true
})
```

**HTML.md Endpoints:**

```typescript
// Automatically serves .html.md endpoints
// /about → serves content
// /about.html.md → serves same content with markdown mime type
```

### Per-Page Configuration

Create custom llms.txt for individual pages:

```typescript
// src/app/docs/llms.txt/route.ts
import { createPageLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createPageLLMsTxtHandlers('https://example.com', {
  title: 'Documentation Hub',
  description: 'Comprehensive guides and API reference',
  sections: [
    {
      title: 'Getting Started',
      items: [
        { title: 'Quick Start', url: '/docs/quickstart' },
        { title: 'Installation', url: '/docs/installation' }
      ]
    }
  ]
})
```

### Custom Generators

Override the default markdown generation:

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt'

const { GET } = createLLMsTxtHandlers({
  title: 'Custom Site',
  generator: (config) => {
    return `# ${config.title}\n\nCustom markdown content here`
  }
})
```

## Examples

### Blog Site Example

```typescript
// src/app/llms.txt/route.ts
import { createEnhancedLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createEnhancedLLMsTxtHandlers({
  title: 'Tech Blog',
  description: 'Latest articles on web development and technology',
  autoDiscovery: {
    baseUrl: 'https://blog.example.com',
    showWarnings: false // Disable in production
  },
  sections: [
    {
      title: 'Popular Posts',
      items: [
        {
          title: 'Getting Started with Next.js 14',
          url: '/posts/nextjs-14-guide',
          description: 'Comprehensive guide to Next.js 14 features'
        },
        {
          title: 'React Server Components Explained',
          url: '/posts/rsc-guide',
          description: 'Deep dive into React Server Components'
        }
      ]
    }
  ]
})
```

### Documentation Site Example

```typescript
// src/app/llms.txt/route.ts
import { createEnhancedLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createEnhancedLLMsTxtHandlers({
  title: 'API Documentation',
  description: 'Complete API reference and guides',
  autoDiscovery: true, // Simple boolean for default config
  sections: [
    {
      title: 'Quick Start',
      items: [
        { title: 'Installation', url: '/docs/installation' },
        { title: 'Authentication', url: '/docs/auth' },
        { title: 'First API Call', url: '/docs/quickstart' }
      ]
    },
    {
      title: 'API Reference',
      items: [
        { title: 'Users API', url: '/api-reference/users' },
        { title: 'Orders API', url: '/api-reference/orders' },
        { title: 'Webhooks', url: '/api-reference/webhooks' }
      ]
    }
  ]
})
```

### Multi-Language Documentation

```typescript
// src/app/[lang]/llms.txt/route.ts
import { createPageLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createPageLLMsTxtHandlers('https://docs.example.com', {
  title: 'Multi-Language Docs',
  description: 'Documentation available in multiple languages',
  sections: [
    {
      title: 'Languages',
      items: [
        { title: 'English', url: '/en/docs' },
        { title: 'Spanish', url: '/es/docs' },
        { title: 'French', url: '/fr/docs' },
        { title: 'German', url: '/de/docs' }
      ]
    }
  ]
})
```

## Best Practices

### Organization

**Group Related Content:**

```typescript
sections: [
  {
    title: 'Documentation',
    items: [
      { title: 'Getting Started', url: '/docs/intro' },
      { title: 'API Reference', url: '/docs/api' }
    ]
  },
  {
    title: 'Examples',
    items: [
      { title: 'Basic Usage', url: '/examples/basic' },
      { title: 'Advanced Patterns', url: '/examples/advanced' }
    ]
  }
]
```

**Use Descriptive Titles:**

```typescript
// ✅ Good
{ title: 'User Authentication Guide', url: '/docs/auth' }

// ❌ Avoid
{ title: 'Auth', url: '/docs/auth' }
```

### Performance

**Enable Auto-Discovery Selectively:**

```typescript
// ✅ Production: Disable warnings
autoDiscovery: {
  baseUrl: 'https://example.com',
  showWarnings: false
}

// ✅ Development: Enable warnings
autoDiscovery: {
  baseUrl: 'http://localhost:3000',
  showWarnings: true
}
```

### SEO & Accessibility

**Include Meaningful Descriptions:**

```typescript
{
  title: 'API Authentication',
  url: '/docs/auth',
  description: 'Learn how to authenticate API requests using JWT tokens'
}
```

**Use Absolute URLs:**

```typescript
// ✅ Absolute URLs work better for AI systems
baseUrl: 'https://example.com'

// ❌ Avoid relative URLs
baseUrl: '/api'
```

### Content Strategy

**Keep It Current:**

- Regularly review and update your llms.txt content
- Remove outdated links and sections
- Add new important pages as they're created

**Focus on Value:**

- Prioritize your most important content
- Group related items logically
- Include clear descriptions for complex topics

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/next-llms-txt.git
cd next-llms-txt

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Running Tests

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- discovery.test.ts

# Run tests in watch mode during development
npm run test:watch
```

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Specification Compliance

This package follows the [llms.txt specification](https://llmstxt.org):

- **H1 header**: Project/site title (required)
- **Blockquote**: Brief description (optional)
- **H2 sections**: Organized content categories
- **Markdown lists**: Links with optional descriptions
- **Clean format**: Optimized for LLM consumption

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and version history.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation**: [GitHub Wiki](https://github.com/yourusername/next-llms-txt/wiki)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/next-llms-txt/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/next-llms-txt/discussions)
- 💬 **Questions**: [GitHub Discussions](https://github.com/yourusername/next-llms-txt/discussions/categories/q-a)

### Compatibility

- **Next.js**: 12.0+ (tested with 13.x and 14.x)
- **Node.js**: 16.0+ (LTS recommended)
- **TypeScript**: 4.5+ (optional but recommended)
- **React**: 17.0+ (for Next.js compatibility)

### Related Projects

- 🌐 **[llms.txt Specification](https://llmstxt.org)** - Official format specification
- 🔧 **[llms-txt CLI](https://github.com/example/llms-txt-cli)** - Command-line generation tool
- 📝 **[llms-txt Validator](https://github.com/example/llms-txt-validator)** - Format validation utility

---

<div align="center">
  <strong>next-llms-txt</strong> - Making AI-friendly documentation effortless in Next.js
  <br/>
  <sub>Built with ❤️ by the open source community</sub>
</div>
