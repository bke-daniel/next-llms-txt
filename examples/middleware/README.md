# Middleware Example

This example shows how to use `next-llms-txt` with Next.js middleware (recommended approach).

## Setup

1. Create a `src/middleware.ts` file:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createLLmsTxt } from 'next-llms-txt';

const { GET: handleLLmsTxt } = createLLmsTxt({
  autoDiscovery: {
    baseUrl: process.env.VERCEL_URL || 'http://localhost:3000',
  },
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept llms.txt and per-page .html.md requests
  if (pathname === '/llms.txt' || pathname.endsWith('.html.md')) {
    return await handleLLmsTxt(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/llms.txt', '/:path*.html.md'],
};
```

2. Add `llmstxt` exports to your pages:

```typescript
// src/app/about/page.tsx
export const llmstxt = {
  title: 'About Us',
  description: 'Learn about our company mission and values.',
};

export default function AboutPage() {
  return <div>About Page</div>;
}
```

## Benefits

- ✅ No cluttering of the `app` directory
- ✅ Works at root level: `/llms.txt` and `/about.html.md`
- ✅ Intercepts requests before they hit the Next.js router
- ✅ Clean separation of concerns
- ✅ Easy to maintain and update

## URLs Generated

- Site-wide: `http://localhost:3000/llms.txt`
- Per-page: `http://localhost:3000/about.html.md`
- Per-page: `http://localhost:3000/services/consulting.html.md`
