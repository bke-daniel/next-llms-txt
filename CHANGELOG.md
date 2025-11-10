# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
