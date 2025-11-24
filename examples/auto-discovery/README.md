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

## Step 2: Create the route handler

```typescript
// app/llms.txt/route.ts
import { createLLmsTxt } from 'next-llms-txt';

export const { GET } = createLLmsTxt({
  baseUrl: 'https://example.com',
  defaultConfig: {
    title: 'My Website',
    description: 'Automatically discovered content from Next.js pages'
  },
  autoDiscovery: {
    baseUrl: 'https://example.com',
    appDir: 'src/app', // or just 'app'
    showWarnings: true // Helpful during development
  }
});
```

## How it works

The auto-discovery system:

1. Scans your `app/` or `src/app/` directory
2. Finds all page files (`page.tsx`, `page.jsx`, etc.)
3. Extracts `llmstxt` or `metadata` exports
4. Automatically generates organized sections
5. Handles dynamic routes like `[id]` and `[...slug]`
6. Excludes Next.js internal files

## Result

Visit `http://localhost:3000/llms.txt` to see your auto-generated file with all discovered pages.
