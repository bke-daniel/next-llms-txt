# Usage Guide

This guide shows how to use `next-llms-txt` following the same pattern as Next.js static metadata.

## Quick Start

Just like how you export metadata from your pages in Next.js:

```typescript
// Next.js Metadata Pattern
export const metadata = {
  title: 'My Page',
  description: 'Page description'
}
```

You can export llms.txt configuration using a similar pattern with this package:

```typescript
// next-llms-txt Pattern
import { createLLMsTxtHandlers } from 'next-llms-txt';

export const { GET } = createLLMsTxtHandlers({
  title: "My App",
  description: "App description",
  sections: [...]
});
```

## Step-by-Step Setup

### 1. Install the Package

```bash
npm install next-llms-txt
```

### 2. Create a Central Configuration File

Create `lib/llmstxt.ts` (or any location you prefer):

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createLLMsTxtHandlers({
  title: 'My Next.js Application',
  description: 'A powerful web application built with Next.js',
  sections: [
    {
      title: 'Documentation',
      items: [
        {
          title: 'Getting Started',
          url: '/docs/getting-started',
          description: 'Learn how to get started with our app'
        },
        {
          title: 'API Documentation',
          url: '/docs/api',
          description: 'Complete API reference'
        },
        {
          title: 'Guides',
          url: '/docs/guides',
          description: 'Step-by-step tutorials'
        }
      ]
    },
    {
      title: 'Examples',
      items: [
        {
          title: 'Basic Example',
          url: '/examples/basic',
          description: 'Simple usage example'
        },
        {
          title: 'Advanced Usage',
          url: '/examples/advanced',
          description: 'Complex scenarios and patterns'
        }
      ]
    },
    {
      title: 'Community',
      items: [
        {
          title: 'GitHub',
          url: 'https://github.com/yourorg/yourproject',
          description: 'Source code and issues'
        },
        {
          title: 'Discord',
          url: 'https://discord.gg/yourserver',
          description: 'Join our community'
        }
      ]
    }
  ]
})
```

### 3. Create the API Route

Following the Auth.js pattern, create `app/llms.txt/route.ts`:

```typescript
import { GET } from '@/lib/llmstxt'

export { GET }
```

### 4. Test Your Setup

Start your development server:

```bash
npm run dev
```

Visit `http://localhost:3000/llms.txt` to see your generated file!

## Expected Output

The above configuration will generate:

```markdown
# My Next.js Application

> A powerful web application built with Next.js

## Documentation
- [Getting Started](/docs/getting-started): Learn how to get started with our app
- [API Documentation](/docs/api): Complete API reference
- [Guides](/docs/guides): Step-by-step tutorials

## Examples
- [Basic Example](/examples/basic): Simple usage example
- [Advanced Usage](/examples/advanced): Complex scenarios and patterns

## Community
- [GitHub](https://github.com/yourorg/yourproject): Source code and issues
- [Discord](https://discord.gg/yourserver): Join our community
```

## Why This Pattern?

This pattern follows the same philosophy as:

1. **Next.js Metadata** - Export configuration from files
2. **Auth.js** - Central configuration with re-exported handlers
3. **Separation of Concerns** - Configuration separate from routing

## TypeScript Support

Full TypeScript support with auto-completion:

```typescript
import { createLLMsTxtHandlers, LLMsTxtConfig } from 'next-llms-txt'

// Config is fully typed
const config: LLMsTxtConfig = {
  title: 'My App', // required
  description: 'Optional description',
  sections: [
    {
      title: 'Section Name',
      items: [
        {
          title: 'Link Title',
          url: '/path',
          description: 'Optional description'
        }
      ]
    }
  ]
}

export const { GET } = createLLMsTxtHandlers(config)
```

## Next Steps

- Check out the [basic example](./basic-app-router/) for a complete working setup
- See the [advanced example](./advanced/) for custom generators and dynamic content
- Read the [main README](../README.md) for full API documentation
