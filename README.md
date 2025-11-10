# next-llms-txt

A Next.js plugin for generating [llms.txt](https://llmstxt.org) files to make your website more accessible to Large Language Models (LLMs).

## What is llms.txt?

`llms.txt` is a markdown file that helps AI agents like ChatGPT and Claude understand your website structure and find key resources. It follows the [llmstxt.org specification](https://llmstxt.org) with a standardized format that's easy for both humans and LLMs to read.

## Features

- 🚀 Easy integration with Next.js App Router
- 📝 Follows the official [llmstxt.org specification](https://llmstxt.org)
- 🔄 Similar API to Next.js metadata and Auth.js
- 💪 Full TypeScript support
- 🎯 Supports both ESM and CommonJS

## Installation

```bash
npm install next-llms-txt
```

## Usage

### Basic Setup (Auth.js Pattern)

The recommended approach follows the Auth.js pattern where you define your configuration in a central file and re-export the handlers in your API route.

#### 1. Create your llms.txt configuration

Create a file to define your llms.txt content (e.g., `lib/llmstxt.ts`):

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createLLMsTxtHandlers({
  title: 'My Awesome Project',
  description: 'A brief summary of what your project does',
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

#### 2. Create the API route

Create an API route file at `app/llms.txt/route.ts`:

```typescript
import { GET } from '@/lib/llmstxt'

export { GET }
```

That's it! Your site will now serve an llms.txt file at `/llms.txt`.

### Generated Output

The above configuration will generate:

```markdown
# My Awesome Project

> A brief summary of what your project does

## Documentation
- [Getting Started](/docs/getting-started): Quick intro for new users
- [API Reference](/docs/api): Complete API documentation

## Examples
- [Basic Example](/examples/basic): Simple example to get started
```

### Advanced Configuration

You can also pass a `LLMsTxtHandlerConfig` for more control:

```typescript
import { createLLMsTxtHandlers, LLMsTxtConfig } from 'next-llms-txt';

export const { GET } = createLLMsTxtHandlers({
  baseUrl: "https://mysite.com",
  defaultConfig: {
    title: "My Project",
    description: "Description here",
    sections: [...]
  },
  generator: (config: LLMsTxtConfig) => {
    // Custom generator function
    return `# ${config.title}\n\nCustom content`;
  }
});
```

## Configuration Options

### `LLMsTxtConfig`

The main configuration object for your llms.txt content:

```typescript
interface LLMsTxtConfig {
  /** Title (H1 header - REQUIRED) */
  title: string

  /** Brief summary (optional blockquote) */
  description?: string

  /** Sections to include */
  sections?: LLMsTxtSection[]
}
```

### `LLMsTxtSection`

A section in your llms.txt file:

```typescript
interface LLMsTxtSection {
  /** Section title (H2 header) */
  title: string

  /** List of items in this section */
  items: LLMsTxtItem[]
}
```

### `LLMsTxtItem`

An item within a section:

```typescript
interface LLMsTxtItem {
  /** Display text for the link */
  title: string

  /** URL for the link */
  url: string

  /** Optional description */
  description?: string
}
```

## Best Practices

1. **Keep it concise**: Focus on the most important documentation and resources
2. **Use markdown links**: Link to markdown versions of your docs when possible
3. **Organize logically**: Group related items into sections
4. **Add descriptions**: Help LLMs understand what each link contains
5. **Update regularly**: Keep your llms.txt in sync with your documentation

## Example Projects

See the `examples/` directory for complete working examples:

- Basic Next.js App Router setup
- Advanced configuration with custom generators
- Integration with existing documentation sites

## Specification

This package follows the [llmstxt.org specification](https://llmstxt.org). The generated file uses markdown format with:

- **H1 header**: Project name (required)
- **Blockquote**: Brief summary (optional)
- **H2 sections**: Organized categories
- **Markdown lists**: Links with optional descriptions

## Development

### Building the Package

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run dev
```

### Publishing to npm

The package is configured for easy publishing to npm:

```bash
# Build and publish
npm publish
```

The `prepublishOnly` script will automatically build the package before publishing.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Guidelines

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure TypeScript types are properly exported

## License

MIT
