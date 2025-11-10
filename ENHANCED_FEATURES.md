# Complete LLMs.txt System Documentation

## Overview

The enhanced `next-llms-txt` system provides comprehensive automatic page discovery and llms.txt generation for Next.js applications. It supports both App Router and Pages Router with intelligent configuration detection, warnings, and multiple output formats.

## Key Features

### 🔍 **Automatic Page Discovery**

- Scans your Next.js project for pages in both App Router (`src/app`) and Pages Router (`src/pages`)
- Detects exported `llmstxt` configurations and `metadata` fallbacks
- Generates warnings for pages without proper configuration
- Excludes pages that cannot generate valid llms.txt entries

### 📝 **Multiple Configuration Methods**

1. **Explicit llmstxt export** (recommended)
2. **Next.js metadata fallback** (with warning)
3. **Auto-generated configuration** (for basic pages)

### 🌐 **Flexible URL Support**

- Site-wide llms.txt at `/llms.txt`
- Individual page llms.txt at any route with `.html.md` extension
- Supports trailing slash variations
- Handles index routes (`/index.html.md` → `/`)

### ⚠️ **Intelligent Warning System**

- Build-time and dev-time warnings for configuration issues
- Metadata fallback usage notifications
- Missing configuration alerts

## Implementation Guide

### 1. Basic Site-Wide Setup

For automatic site-wide llms.txt generation:

```typescript
// app/llms.txt/route.ts (App Router)
import { createEnhancedLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createEnhancedLLMsTxtHandlers({
  autoDiscovery: {
    baseUrl: 'https://www.next-llms-txt.com',
    showWarnings: true, // Enable development warnings
  },
})
```

### 2. Individual Page Configuration

Add llms.txt configuration to your pages:

```typescript
// app/services/a/page.tsx
import type { LLMsTxtConfig } from 'next-llms-txt'

export const llmstxt: LLMsTxtConfig = {
  title: 'Service A',
  description: 'Advanced AI consulting and implementation',
  sections: [
    {
      title: 'Documentation',
      items: [
        {
          title: 'Getting Started',
          url: '/docs/service-a/getting-started',
          description: 'How to get started with Service A'
        }
      ]
    }
  ]
}

export default function ServiceAPage() {
  return <div>Service A Content</div>
}
```

### 3. Metadata Fallback (generates warning)

```typescript
// app/services/no-export/page.tsx
export const metadata = {
  title: 'Service Without Export',
  description: 'This service uses metadata fallback for llms.txt generation',
}

export default function NoExportPage() {
  return <div>Service Content</div>
}
```

### 4. Individual Page llms.txt Routes

For per-page llms.txt files:

```typescript
// app/[...slug]/llms.txt/route.ts
import { createPageLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createPageLLMsTxtHandlers('https://www.next-llms-txt.com', {
  autoDiscovery: {
    showWarnings: true,
  },
  trailingSlash: true, // Support trailing slash variations
})
```

## URL Patterns Supported

### Site-Wide llms.txt

- `https://www.next-llms-txt.com/llms.txt`

### Individual Page llms.txt

- `https://www.next-llms-txt.com/index.html.md` → Homepage llms.txt
- `https://www.next-llms-txt.com/services.html.md` → Services page llms.txt
- `https://www.next-llms-txt.com/services/a.html.md` → Service A page llms.txt
- `https://www.next-llms-txt.com/services/no-export.html.md` → Uses metadata fallback

### Trailing Slash Support

All URLs work with or without trailing slashes:

- `/services` and `/services/` both work
- `/services.html.md` and `/services/.html.md` both work

## Warning System

The system generates helpful warnings during development and build:

### ⚠️ Metadata Fallback Warning

```
[next-llms-txt] Using metadata fallback for llms.txt generation - consider adding explicit llmstxt export (/services/no-export)
```

### ❌ No Configuration Warning

```
[next-llms-txt] No llms.txt export or metadata found - cannot generate llms.txt entry (/services/no-export-at-all)
```

### Expected Behavior by Page

| Page Route | Configuration | Included in Site llms.txt | Individual .html.md | Warning |
|------------|---------------|---------------------------|-------------------|---------|
| `/` | ✅ llmstxt export | ✅ Yes | ✅ Available | None |
| `/services/` | ✅ llmstxt export | ✅ Yes | ✅ Available | None |
| `/services/a/` | ✅ llmstxt export | ✅ Yes | ✅ Available | None |
| `/services/b/` | ✅ llmstxt export | ✅ Yes | ✅ Available | None |
| `/services/c/` | ✅ llmstxt export | ✅ Yes | ✅ Available | None |
| `/services/no-export/` | ⚠️ metadata only | ✅ Yes | ✅ Available | Metadata fallback |
| `/services/no-export-at-all/` | ❌ Nothing | ❌ No | ❌ 404 | No configuration |

## Testing

The system includes comprehensive tests for all scenarios:

### Run Tests

```bash
# All tests
npm test

# Specific test suites
npm test -- tests/unit/discovery.test.ts
npm test -- tests/unit/enhanced-handler.test.ts
npm test -- tests/integration/complete-system.test.ts
```

### Test Coverage

- ✅ Page discovery in App Router and Pages Router
- ✅ llmstxt export detection
- ✅ Metadata fallback handling
- ✅ Warning generation
- ✅ URL normalization and trailing slash support
- ✅ Site-wide llms.txt generation
- ✅ Individual page llms.txt generation
- ✅ Error handling and edge cases

## Advanced Configuration

### Custom Discovery Options

```typescript
export const { GET } = createEnhancedLLMsTxtHandlers({
  autoDiscovery: {
    baseUrl: 'https://www.next-llms-txt.com',
    appDir: 'src/app',      // Custom app directory
    pagesDir: 'src/pages',  // Custom pages directory
    rootDir: process.cwd(), // Custom root directory
    showWarnings: process.env.NODE_ENV === 'development',
  },
})
```

### Custom Generator Function

```typescript
export const { GET } = createEnhancedLLMsTxtHandlers({
  autoDiscovery: true,
  generator: (config) => {
    // Custom llms.txt generation logic
    return customGenerateLLMsTxt(config)
  },
})
```

### Manual Discovery Usage

```typescript
import { LLMsTxtAutoDiscovery } from 'next-llms-txt'

const discovery = new LLMsTxtAutoDiscovery({
  baseUrl: 'https://www.next-llms-txt.com',
  showWarnings: true,
})

const pages = await discovery.discoverPages()
const siteConfig = await discovery.generateSiteConfig()
const warnings = discovery.getWarnings()
```

## Migration from Basic Setup

If you're using the basic `createLLMsTxtHandlers`, you can easily upgrade:

### Before (Basic)

```typescript
import { createLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createLLMsTxtHandlers({
  title: "My Site",
  description: "A manually configured site",
  // ... manual configuration
})
```

### After (Enhanced)

```typescript
import { createEnhancedLLMsTxtHandlers } from 'next-llms-txt'

export const { GET } = createEnhancedLLMsTxtHandlers({
  autoDiscovery: {
    baseUrl: 'https://www.next-llms-txt.com',
  },
  // Automatic discovery replaces manual configuration
})
```

## Troubleshooting

### No Pages Discovered

- Verify `rootDir`, `appDir`, and `pagesDir` paths are correct
- Check that page files are named `page.tsx` (App Router) or `index.tsx`/`[name].tsx` (Pages Router)
- Ensure directories exist and are readable

### Pages Not Included in Site llms.txt

- Add `llmstxt` export or `metadata` export to the page
- Check console warnings for specific issues
- Verify the configuration is properly typed

### Individual Page Routes Return 404

- Ensure the page has valid configuration (llmstxt export or metadata)
- Check that the route matches the actual page path
- Verify trailing slash configuration if needed

This comprehensive system provides a complete solution for automatic llms.txt generation across your entire Next.js application with proper warning systems and flexible configuration options.
