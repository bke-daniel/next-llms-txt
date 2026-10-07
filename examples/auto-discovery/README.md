# Auto-Discovery Example

Automatically scan your Next.js app and generate `llms.txt` from your pages.

## Setup

```bash
npm install next-llms-txt
```

## Step 1: Add content to your pages

```typescript
// app/about/page.tsx
export const llmstxt = {
  title: 'About Us',
  description: 'Learn about our company mission and values'
};

export default function AboutPage() {
  return <div>About content</div>;
}
```

Or use existing metadata:

```typescript
// app/services/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Professional services we offer'
};

export default function ServicesPage() {
  return <div>Services content</div>;
}
```

## Step 2: Route the requests through `proxy.ts`

```typescript
// src/proxy.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLLmsTxt, isLLMsTxtPath } from 'next-llms-txt';

const { GET: handleLLmsTxt } = createLLmsTxt({
  baseUrl: 'https://example.com',
  defaultConfig: {
    title: 'My Website',
    description: 'Automatically discovered content from Next.js pages'
  },
  autoDiscovery: {
    appDir: 'src/app' // or just 'app'
  },
  showWarnings: true // Helpful during development
});

export default async function proxy(request: NextRequest) {
  if (isLLMsTxtPath(request.nextUrl.pathname))
    return await handleLLmsTxt(request);
  return NextResponse.next();
}

export const config = {
  matcher: ['/llms.txt', '/:path*.html.md']
};
```

The list items in `llms.txt` link to each page's markdown variant (`/about.html.md`, `/services.html.md`), so the proxy has to answer those routes too. A route handler at `app/llms.txt/route.ts` would serve `/llms.txt` alone and leave those links at 404.

## How it works

The auto-discovery system:

1. Scans your `app/` or `src/app/` directory
2. Finds all page files (`page.tsx`, `page.jsx`, etc.)
3. Extracts `llmstxt` or `metadata` exports
4. Automatically generates organized sections
5. Handles dynamic routes like `[id]` and `[...slug]`
6. Excludes Next.js internal files

## Result

Visit `http://localhost:3000/llms.txt` to see your auto-generated file with all discovered pages:

```markdown
# My Website
> Automatically discovered content from Next.js pages

## Main Pages
- [About Us](https://example.com/about.html.md): Learn about our company mission and values
- [Our Services](https://example.com/services.html.md): Professional services we offer
```

Each link answers with the page's markdown, e.g. `http://localhost:3000/about.html.md`.
