# Basic Example

Simple manual configuration of `llms.txt` content.

## Setup

```bash
npm install next-llms-txt
```

## Usage

Create `app/llms.txt/route.ts`:

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
            description: 'Quick introduction for new users'
          },
          {
            title: 'API Reference',
            url: 'https://example.com/docs/api',
            description: 'Complete API documentation'
          }
        ]
      },
      {
        title: 'Examples',
        items: [
          {
            title: 'Basic Example',
            url: 'https://example.com/examples/basic',
            description: 'Simple example to get started'
          }
        ]
      }
    ]
  }
});
```

## Result

Visit `http://localhost:3000/llms.txt` to see your generated file.
