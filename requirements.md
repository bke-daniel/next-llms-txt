
# `next-llms-txt` Package Requirements

### Core Functionality

1. **`llms.txt` Generation**: The package must generate markdown content that adheres to the `llmstxt.org` specification, creating both a main site-wide file and individual files for specific pages.
2. **Next.js Integration**: It provides a handler function intended for use within a Next.js project, typically inside a configuration file (e.g., `next.config.js` or a dedicated config file) to avoid cluttering the `app` directory.

### API and Configuration
>
> copilot info: I really want to challenge this as it is not need on my book. If we can replace this with a next.js like config i am happy

1. **Main Entry Point**: A single function, `createUnifiedLLMsTxtHandlers`, serves as the public API.
2. **Handler Return**: This function returns an object containing a `GET` method suitable for a Next.js route handler.
3. **Configuration Object**: The main function accepts a configuration object that can be either:
    * A simple `LLMsTxtConfig` for a basic, static `llms.txt` file.
    * An `EnhancedHandlerConfig` to enable advanced features like auto-discovery.

### Auto-Discovery

1. **Page Scanning**: When enabled, the package must scan the Next.js `app` directory to find all page files (`page.tsx`, `page.ts`, etc.).
2. **Configuration Extraction**: It must parse these page files to extract configuration from exported objects:
    * **Primary**: Looks for an `export const llmstxt: LLMsTxtConfig`.
    * **Fallback**: If the primary is missing, it uses `export const metadata: Metadata`, extracting the `title` and `description`.
3. **Route Generation**: It must correctly convert file paths into URL routes (e.g., `app/about/page.tsx` becomes `/about`).

### Content Generation & Routing

1. **Site-Wide File**: For a root request (e.g., `/llms.txt`), it generates a comprehensive markdown file by merging a default configuration with the configurations of all discovered pages.
2. **Section Organization**: Discovered pages are automatically grouped into sections like "Main Pages" and "Services" based on their URL structure.
3. **Per-Page Files**: For a specific page request (e.g., `/about.html.md`), it returns the markdown content derived from that page's specific configuration. The generated file follows the `https://llmstxt.org` specification.
4. **Path Specificity**: The handler is designed to respond specifically to requests ending in `.html.md`. It does not interfere with standard page routes like `/about` or `/about.html`.

### Output and Headers

1. **Response Type**: All generated content is returned within a `NextResponse`.
2. **Content-Type**: The response must have the `Content-Type` header set to `text/markdown; charset=utf-8`.
3. **Caching**: The response includes a default `Cache-Control` header, which can be customized or overridden as needed.

### Warning System

1. **Developer Feedback**: The package generates console warnings during both development and build phases to flag common issues, such as:
    * A page using the `metadata` fallback instead of a dedicated `llmstxt` export.
    * A page missing any valid configuration export.
    * The specified `appDir` not being found.
