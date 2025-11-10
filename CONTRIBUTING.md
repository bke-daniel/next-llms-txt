# Contributing to next-llms-txt

Thank you for your interest in contributing to next-llms-txt! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/yourusername/next-llms-txt.git
cd next-llms-txt
```

2. **Install dependencies**

```bash
npm install
```

3. **Build the project**

```bash
npm run build
```

4. **Start development mode** (watches for changes)

```bash
npm run dev
```

## Project Structure

```
next-llms-txt/
├── src/
│   ├── types.ts       # TypeScript type definitions
│   ├── generator.ts   # llms.txt content generator
│   ├── handler.ts     # Next.js API route handlers
│   └── index.ts       # Public API exports
├── examples/          # Usage examples
├── dist/              # Build output (generated, not committed)
└── README.md          # Main documentation
```

## Making Changes

1. **Create a new branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

   - Follow the existing code style
   - Add TypeScript types for all new code
   - Update documentation if needed

3. **Build and test**

```bash
# Build the package
npm run build

# Check the build output
ls -lh dist/
```

4. **Update documentation**

   - Update README.md if adding features
   - Update CHANGELOG.md with your changes
   - Add examples if appropriate

5. **Commit your changes**

```bash
git add .
git commit -m "feat: add new feature"
```

## Commit Message Guidelines

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Adding tests

Examples:
```
feat: add support for dynamic content
fix: handle empty sections correctly
docs: update installation instructions
```

## Code Style

- Use TypeScript for all code
- Follow the existing formatting
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Pull Request Process

1. Update documentation to reflect your changes
2. Add examples if introducing new features
3. Ensure the build passes: `npm run build`
4. Update CHANGELOG.md
5. Create a pull request with a clear description

## Adding New Features

When adding new features:

1. **Maintain backwards compatibility** - Don't break existing APIs
2. **Follow the llmstxt.org spec** - Ensure compliance
3. **Add TypeScript types** - Full type safety required
4. **Document thoroughly** - Update README and examples
5. **Keep it simple** - This is a focused plugin

## Testing

Currently, the project doesn't have automated tests. When adding tests:

1. Use a testing framework like Jest or Vitest
2. Test the generator output
3. Test the handler responses
4. Test TypeScript types

## Questions?

Feel free to:
- Open an issue for discussion
- Ask questions in pull requests
- Suggest improvements

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on what's best for the project

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
