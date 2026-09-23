# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - Unreleased

See the [migration notes](./README.md#migrating-from-1x-to-20) in the README.

### Breaking

- **Configuration is validated when `createLLmsTxt` is called**, not on the first request. A config without `defaultConfig.title`, a non-empty `pages` array or an enabled `autoDiscovery` now throws `LLMsTxtConfigError` at startup. In 1.x the validator was never enforced.
- **`autoDiscovery: false` is respected.** 1.x silently re-enabled discovery with the default settings.
- **`llms.txt` output changed.** Discovered pages are grouped into sections (root-level routes under `Main Pages`, deeper routes by their first path segment) and each route is emitted once. 1.x put every discovered page into a single bucket and could list a route twice. `## Pages` now only holds pages passed through `pages`. Items without a `title` and sections without renderable items are dropped, and the output ends with a single newline.
- **Pages Router files are discovered by default** (`pagesDir: 'src/pages'`); 1.x only scanned the App Router. When both routers register the same route, the App Router page wins.
- **Pages inside App Router route groups are discovered.** `app/(marketing)/about/page.tsx` is listed at `/about`; 1.x skipped every `(group)` directory. Intercepting routes (`(.)photo`) and parallel-route slots (`@modal`) are skipped, since they render inside another page rather than at a URL of their own.
- **`generator` receives `LLMsTxtPage[]`** as its second argument instead of the internal `PageInfo[]`. `LLMsTxtPage` has `route` and `config` only.
- **Per-page `*.html.md` status codes:** `400` when auto-discovery is off, `404` when no page matches, `500` when a custom `generator` returns an empty result (was `400`).
- **Discovery trace output moved from `console.log` to `debug`.** Enable it with `DEBUG=next-llms-txt:*`. Warnings controlled by `showWarnings` still use `console.warn`.
- **ESM-only manifest.** `main` and the `require` export are gone. They pointed at `dist/index.js`, which the build never produced, so `require('next-llms-txt')` did not work in 1.x either; it now fails with Node's ESM-only error instead of module-not-found.
- **Dead code removed:** the unexported, deprecated `createPageLLMsTxtHandlers` helper and `getAutoDiscoveryConfig`.

### Added

- TypeScript 6.x and 7.x support. The `typescript` peer range is now `^5.9.3 || ^6.0.0 || ^7.0.0`, and CI type-checks the sources and a consumer of the published declarations with TypeScript 5.9, 6.0 and 7.0. Installing 1.0.2 next to TypeScript 6 or 7 failed with `ERESOLVE`.
- `LLMsTxtError`, `LLMsTxtConfigError` and `LLMsTxtGenerationError`, exported for `instanceof` checks.
- `LLMsTxtPage` type and a typed `pages` option for supplying pages by hand. A page passed through `pages` overrides a discovered page with the same route.
- `onError` hook, called with the original error (including its `cause` chain) when a request throws, before the `500` response is sent. The `500` for a custom `generator` that returns nothing does not call it yet (#51).
- `cacheControl` option: a custom header value, or `false` to omit the header. The default stays `public, max-age=3600, s-maxage=3600`.
- `discoveryTimeoutMs` option. Discovery also stops when the request is aborted.
- `autoDiscovery.llmstxtExportName` (default `llmstxt`) and `autoDiscovery.extensions` (extension priority for page entries and import resolution).
- Pages Router discovery. It skips `_app`, `_document`, `_error`, `404`, `500`, the `api/` directory, underscore-prefixed files, and test, spec, story and declaration files.
- App Router discovery of `page.js` and `page.jsx`.
- `"sideEffects": false`, so bundlers can tree-shake the package.

### Changed

- `typescript` is an optional peer dependency; the library never imports it at runtime.
- `engines.node` is now `>=22.0.0`. The last release, 1.0.2, declared `^22.0.0 || ^24.0.0`, so Node.js 23 and 25+ are no longer excluded. CI runs the unit tests on Node.js 22 and 24.
- TypeScript 5.9 remains supported. TypeScript 6 requires Next.js 16.2.2+ and TypeScript 7 requires Next.js 16.3.0+ (or 16.2.12+ with `experimental.useTypeScriptCli`); see the Compatibility section of the README.
- `autoDiscovery.rootDir` resolves against the current working directory at request time when unset. 1.x froze a directory at module load.
- `defaultConfig` is deep-merged with the defaults, so a partial override no longer drops sibling keys.
- `/llms.txt/` (trailing slash) is routed to the site handler. `/foo/index` and `/foo/` normalise to `/foo`, and Windows path separators are normalised once at the boundary.
- Discovery uses asynchronous file system access, extracts exports in a single AST pass and caches parsed files, so a module imported by many pages is parsed once.
- Dependencies upgraded, including `@babel/*` 7.29.

### Fixed

- Object-shaped `metadata.title` (`{ default, template, absolute }`) is resolved to a string in the metadata fallback.
- Template-literal titles keep their placeholders instead of being cut off at the first interpolation.
- Dynamic and catch-all segments (`[id]`, `[...slug]`) no longer leak into titles derived from the route.
- `export const llmstxt = { … } satisfies LLMsTxtConfig` and `as const` are recognised. 1.x treated such exports as absent and fell back to `metadata` (#51).
- Property values that are identifiers declared in the same file (`title: PAGE_TITLE`) are resolved. A title that cannot be read statically no longer drops the page from `llms.txt` and crashes its `*.html.md` route with a `TypeError`; the page keeps a route-derived title and a warning is recorded (#51).
- Sections from `defaultConfig` are kept next to discovered sections instead of being overwritten.
- Error responses are created per request. 1.x reused one `NextResponse` instance, whose body can only be read once.
- Symlink cycles no longer hang discovery.
- A malformed `tsconfig.json` stays non-fatal (path aliases are not followed for that run). The failure, with the file path, is logged to the `next-llms-txt:discovery` debug channel only.
- `@babel/traverse` and `debug` (both CommonJS) are unwrapped correctly when the bundle runs as native ESM.
- The published bundle no longer references a source map that is not part of the tarball.

### Removed

- `@babel/generator` from the runtime dependencies; it was unused.

## [1.0.2] - 2025-12-03

### Changed

- `engines.node` widened from `^22.0.0` to `^22.0.0 || ^24.0.0`.

## [1.0.1] - 2025-12-02

### Changed

- `llms.txt` and `*.html.md` responses are served as `text/markdown; charset=utf-8` instead of `text/plain`.

## [1.0.0] - 2025-11-24

### Added

- Unified `createLLmsTxt` API replacing multiple deprecated handler factories
- `isLLMsTxtPath` predicate utility for routing `/llms.txt` and `*.html.md` requests
- Proxy-first integration pattern for Next.js 16+
- Comprehensive test suite with 236 passing tests achieving 80%+ coverage
- Development warnings for missing configurations (disabled in production by default)
- Custom generator override support for bespoke markdown formatting
- Flexible section and item organization with duplicate detection
- Static matcher configuration ensuring Next.js 16+ compatibility
- Enhanced documentation with linked table of contents
- Highlights section showcasing key features and benefits

### Changed

- **BREAKING**: Minimum Next.js version now 16.0+ (15.x may work with manual proxy config but unsupported)
- **BREAKING**: Minimum Node.js version now 22.0+
- **BREAKING**: Minimum React version now 19.2+
- **BREAKING**: Minimum TypeScript version now 5.9+
- All code examples updated to use `proxy.ts` instead of `middleware.ts` (Next.js 16+ standard)
- Documentation restructured for improved clarity and navigation
- Type safety improved across configuration merging and handler creation
- Test coverage raised from ~70% to 100% statements, 97%+ branches

### Deprecated

- `createLLMsTxtHandlers` - use `createLLmsTxt` instead
- `createEnhancedLLMsTxtHandlers` - use `createLLmsTxt` instead
- `createPageLLMsTxtHandlers` - use `createLLmsTxt` with `isLLMsTxtPath` instead
- `LLMs_TXT_MATCHER` dynamic matcher - incompatible with Next.js 16+ static analysis

### Removed

- Legacy multi-handler API patterns from public exports
- Dynamic matcher constant (retained `isLLMsTxtPath` predicate)
- WIP and work-in-progress documentation notices
- Unreachable dead code branches in configuration merging

### Fixed

- Type safety in `handle-site-request.ts` and `handle-page-request.ts` configuration handling
- Markdown linting compliance (heading spacing, list formatting, fenced code languages)
- Test suite reliability: activated skipped tests, removed deprecated fixtures
- Edge case coverage for trailing slashes, empty sections, and malformed paths
- Duplicate heading issues in documentation

### Security

- No known vulnerabilities
- Dependencies updated to latest stable versions
- CodeQL and security scanning enabled in CI/CD pipeline

## [0.6.0] - 2025-11-11

### Added

- Enhanced auto-discovery with boolean configuration option
- Demo server package for testing and examples
- Improved ESLint configuration

### Changed

- Normalized path handling across the library
- Improved test organization and structure

### Fixed

- Demo server build issues
- ESLint configuration conflicts

## [0.5.3] - 2025-11-10

### Fixed

- Minor bug fixes and stability improvements

## [0.5.2] - 2025-11-10

### Changed

- Updated `rootDir` to use `process.env.PWD` for better path resolution

## [0.5.1] - 2025-11-10

### Fixed

- Path alias configuration in tsconfig

## [0.5.0] - 2025-11-10

### Added

- Major feature enhancements and API improvements

## [0.4.4] - 2025-11-09

### Fixed

- Bug fixes and stability improvements

## [0.4.3] - 2025-11-09

### Fixed

- Additional fixes and improvements

## [0.4.2] - 2025-11-09

### Fixed

- Node version compatibility issues
- Test file configuration

## [0.3.4] - 2025-11-08

### Changed

- **BREAKING**: Converted to ESM-only package
- Removed CommonJS support

## [0.3.3] - 2025-11-08

### Changed

- Improved project setup for ESM compatibility

## [0.3.2] - 2025-11-08

### Changed

- Updated configuration handling

## [0.2.0] - 2025-11-10

### Fixed

- **URL Generation**: Fixed a critical bug where `llms.txt` was pointing to the wrong URLs for pages. The library now correctly handles `.html.md` and `index.html.md` files, generating the correct `.html` and root URLs. This ensures that LLMs can correctly associate the markdown content with the actual page URL.

### Changed

- **Discovery Logic**: The auto-discovery mechanism has been updated to correctly identify and process `.html.md` files, ensuring they are included in the generated `llms.txt`.
- **Documentation**: Updated `README.md`, `ENHANCED_FEATURES.md`, and `QUICK_START.md` to reflect the correct URL generation and usage patterns.

## [0.1.0] - 2025-11-10

### Added

- Initial release of next-llms-txt
- Core llms.txt generator following llmstxt.org specification
- API route handlers following Auth.js pattern
- Full TypeScript support with type definitions
- ESM and CommonJS support
- Comprehensive documentation and examples
- Support for custom generator functions
- Markdown output with H1 title, blockquote description, and H2 sections

### Features

- Easy integration with Next.js App Router
- Configurable sections with items and descriptions
- Compatible with Next.js 14, 15, and 16
