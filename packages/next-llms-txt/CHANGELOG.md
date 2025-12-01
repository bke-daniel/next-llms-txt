# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
