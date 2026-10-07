
# `next-llms-txt` Package Requirements

### Core Functionality

1. **`llms.txt` Generation**: The package must generate markdown content that adheres to the `llmstxt.org` specification, creating both a main site-wide file and individual files for specific pages.
2. **Next.js Integration**: It provides a handler function designed for use in Next.js 16 Routing Middleware (`src/proxy.ts`), intercepting requests to `/llms.txt` and `/*.html.md` without cluttering the `app` directory.

### API and Configuration

1. **Main Entry Point**: A single function, `createLLmsTxt`, serves as the public API.
2. **Handler Return**: This function returns an object containing a `GET` method suitable for `proxy.ts` (or a route handler).
3. **Proxy-First Design**: The package is designed to work with `proxy.ts`, intercepting `/llms.txt` and `/*.html.md` requests with one static matcher.
4. **Configuration Object**: The main function accepts an `LLMsTxtHandlerConfig`: `defaultConfig` (an `LLMsTxtConfig`) for the site-wide title, description and hand-written sections, `pages` for hand-added pages, and `autoDiscovery` (on by default) for page discovery. It is validated when the function is called.

### Auto-Discovery

1. **Page Scanning**: When enabled, the package must scan the Next.js App Router directory (`page.tsx`, `page.ts`, etc.) and the Pages Router directory to find all page files.
2. **Configuration Extraction**: It must parse these page files to extract configuration from exported objects:
    * **Primary**: Looks for an `export const llmstxt: LLMsTxtConfig`.
    * **Fallback**: If the primary is missing, it uses `export const metadata: Metadata`, extracting the `title` and `description`.
3. **Route Generation**: It must correctly convert file paths into URL routes (e.g., `app/about/page.tsx` becomes `/about`).

### Content Generation & Routing

1. **Site-Wide File**: For a root request (e.g., `/llms.txt`), it generates a comprehensive markdown file by merging a default configuration with the configurations of all discovered pages.
2. **Section Organization**: Discovered pages are automatically grouped into sections like "Main Pages" and "Services" based on their URL structure.
3. **Markdown Links**: Each discovered or hand-added page is listed with a link to its markdown variant, `${baseUrl}${route}.html.md` (the root as `/index.html.md`), as llmstxt.org recommends.
4. **Per-Page Files**: For a specific page request (e.g., `/about.html.md`), it returns the markdown content derived from that page's specific configuration. The generated file follows the `https://llmstxt.org` specification.
5. **Path Specificity**: The handler is designed to respond specifically to requests ending in `.html.md`. It does not interfere with standard page routes like `/about` or `/about.html`.

### Output and Headers

1. **Response Type**: All generated content is returned within a `NextResponse`.
2. **Content-Type**: The response must have the `Content-Type` header set to `text/markdown; charset=utf-8`.
3. **Caching**: The response includes a default `Cache-Control` header, which can be customized or overridden as needed.

### Warning System

1. **Developer Feedback**: The package generates console warnings during both development and build phases to flag common issues, such as:
    * A page using the `metadata` fallback instead of a dedicated `llmstxt` export.
    * A page missing any valid configuration export.
    * None of the configured discovery directories being found.
