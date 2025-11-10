# Basic App Router Example

This example demonstrates how to use `next-llms-txt` with Next.js App Router.

## Setup

1. Install dependencies:

```bash
npm install next-llms-txt
```

2. Create `lib/llmstxt.ts`:

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt';

export const { GET } = createLLMsTxtHandlers({
  title: "My Next.js App",
  description: "A modern web application built with Next.js",
  sections: [
    {
      title: "Documentation",
      items: [
        {
          title: "Getting Started",
          url: "/docs/getting-started",
          description: "Learn how to set up and use the app"
        },
        {
          title: "API Reference",
          url: "/docs/api",
          description: "Complete API documentation"
        }
      ]
    },
    {
      title: "Resources",
      items: [
        {
          title: "GitHub Repository",
          url: "https://github.com/yourusername/yourproject"
        },
        {
          title: "Community Forum",
          url: "/community"
        }
      ]
    }
  ]
});
```

3. Create `app/llms.txt/route.ts`:

```typescript
import { GET } from "@/lib/llmstxt";
export { GET };
```

4. Visit `/llms.txt` in your browser to see the generated file!

## Expected Output

```markdown
# My Next.js App

> A modern web application built with Next.js

## Documentation
- [Getting Started](/docs/getting-started): Learn how to set up and use the app
- [API Reference](/docs/api): Complete API documentation

## Resources
- [GitHub Repository](https://github.com/yourusername/yourproject)
- [Community Forum](/community)
```
