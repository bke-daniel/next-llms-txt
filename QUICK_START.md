# Quick Start Guide

Get up and running with next-llms-txt in 2 minutes!

## Installation

```bash
npm install next-llms-txt
```

## Basic Setup

### 1. Create `lib/llmstxt.ts`

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt';

export const { GET } = createLLMsTxtHandlers({
  title: "My App",
  description: "Brief description of your app",
  sections: [
    {
      title: "Documentation",
      items: [
        {
          title: "Getting Started",
          url: "/docs/start",
          description: "Quick start guide"
        }
      ]
    }
  ]
});
```

### 2. Create `app/llms.txt/route.ts`

```typescript
import { GET } from "@/lib/llmstxt";
export { GET };
```

### 3. Done!

Visit `http://localhost:3000/llms.txt` to see your generated file.

## Output

```markdown
# My App

> Brief description of your app

## Documentation
- [Getting Started](/docs/start): Quick start guide
```

## Configuration Types

```typescript
interface LLMsTxtConfig {
  title: string;                    // Required
  description?: string;              // Optional
  sections?: LLMsTxtSection[];      // Optional
}

interface LLMsTxtSection {
  title: string;                    // H2 heading
  items: LLMsTxtItem[];            // List items
}

interface LLMsTxtItem {
  title: string;                    // Link text
  url: string;                      // Link URL
  description?: string;             // Optional description
}
```

## Next Steps

- 📖 Read the [full documentation](./README.md)
- 🎯 Check out [examples](./examples/)
- 🔧 See [advanced usage](./examples/advanced/)
- 📝 Review [output format](./examples/OUTPUT_EXAMPLE.md)

## Common Patterns

### Multiple Sections

```typescript
sections: [
  {
    title: "Documentation",
    items: [/* docs */]
  },
  {
    title: "Examples", 
    items: [/* examples */]
  },
  {
    title: "Community",
    items: [/* community links */]
  }
]
```

### With Custom Generator

```typescript
createLLMsTxtHandlers({
  defaultConfig: { /* your config */ },
  generator: (config) => {
    // Custom markdown generation
    return `# ${config.title}\n...`;
  }
});
```

## Help

- 🐛 [Report issues](https://github.com/bke-daniel/next-llms-txt/issues)
- 💬 [Discussions](https://github.com/bke-daniel/next-llms-txt/discussions)
- 📚 [llmstxt.org spec](https://llmstxt.org)
