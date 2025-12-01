# Examples

This directory contains practical examples showing different ways to use `next-llms-txt`.

## Available Examples

### 1. [Basic Setup](./basic)

Simple manual configuration with explicit sections and items. Perfect for smaller sites or when you want full control.

**When to use:** You have a fixed set of pages and want explicit control over what appears in `llms.txt`.

### 2. [Auto-Discovery](./auto-discovery)

Automatically scan your Next.js app and generate `llms.txt` from page exports. Great for larger sites with many pages.

**When to use:** You want to automatically include all pages with minimal configuration.

### 3. [Proxy Integration](./with-proxy)

Complete setup with proxy handling for both `/llms.txt` and `.html.md` endpoints. Most flexible approach.

**When to use:** You want the full feature set including per-page markdown content.

## Quick Start

You can browse a live set of examples locally via the demo server:

```bash
npm run server:demo
```

Then open http://localhost:3000 to explore routes like auto-discovery, metadata-only, llms.txt-only, nested exports, full test, and a proxy-enabled setup.

Each example includes:

- Complete setup instructions
- Commented code examples
- Expected results
- When to use this approach

## Running Examples

To try an example:

1. Copy the code from the example's README
2. Create the necessary files in your Next.js project
3. Start your development server: `npm run dev`
4. Visit the URLs mentioned in each example

## Need Help?

- Read the [main documentation](../../README.md)
- Check the [API Reference](../../README.md#api-reference)
- Ask questions in [GitHub Discussions](https://github.com/bke-daniel/next-llms-txt/discussions)
