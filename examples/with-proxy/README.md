# Proxy Integration Example

Complete setup with proxy handling for both `/llms.txt` and `.html.md` requests.

## Setup

```bash
npm install next-llms-txt
```

## Step 1: Create proxy.ts

```typescript
// src/proxy.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLLmsTxt, isLLMsTxtPath } from 'next-llms-txt';

const { GET: handleLLmsTxt } = createLLmsTxt({
  baseUrl: 'https://example.com',
  defaultConfig: {
    title: 'My Website',
    description: 'Full documentation and guides'
  },
  autoDiscovery: {
    baseUrl: 'https://example.com',
    appDir: 'src/app',
    showWarnings: process.env.NODE_ENV === 'development'
  }
});

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle both /llms.txt and /*.html.md
  if (isLLMsTxtPath(pathname)) {
    return await handleLLmsTxt(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/llms.txt', '/:path*.html.md']
};
```

## Step 2: Add content sources

```typescript
// src/app/docs/page.tsx
export const llmstxt = {
  title: 'Documentation',
  description: 'Complete guide to using our platform'
};

export default function DocsPage() {
  return <div>Docs content</div>;
}
```

## Step 3: Optional - Add markdown files

Create `src/app/docs/page.html.md` for raw content:

```markdown
# Documentation

This is the raw markdown content that LLMs can easily parse.

## Features
- Feature 1
- Feature 2
```

## Benefits

- Single entry point for all LLM-related requests
- Handles both site-wide `llms.txt` and per-page markdown
- Clean separation from your application routes
- Static matcher for Next.js 16+ compatibility

## Result

- Visit `http://localhost:3000/llms.txt` for the main file
- Visit `http://localhost:3000/docs.html.md` for page markdown
