# Example Output

This file shows what the generated `/llms.txt` file looks like.

## Input Configuration

```typescript
{
  title: "FastHTML",
  description: "FastHTML helps developers parse HTML safely and quickly using Python and TypeScript.",
  sections: [
    {
      title: "Documentation",
      items: [
        {
          title: "Quick Start",
          url: "https://fastht.ml/docs/quickstart.md",
          description: "How to set up FastHTML"
        },
        {
          title: "API Reference",
          url: "https://fastht.ml/docs/api.md",
          description: "Full API details"
        },
        {
          title: "Tutorials",
          url: "https://fastht.ml/docs/tutorials.md",
          description: "Step-by-step guides"
        }
      ]
    },
    {
      title: "Community",
      items: [
        {
          title: "Forum",
          url: "https://fastht.ml/community.md",
          description: "Ask questions, share feedback"
        },
        {
          title: "Changelog",
          url: "https://fastht.ml/changelog.md",
          description: "View recent changes"
        }
      ]
    },
    {
      title: "Optional",
      items: [
        {
          title: "Why FastHTML?",
          url: "https://fastht.ml/about.md",
          description: "Key advantages and use cases"
        }
      ]
    }
  ]
}
```

## Generated `/llms.txt` Output

```markdown
# FastHTML

> FastHTML helps developers parse HTML safely and quickly using Python and TypeScript.

## Documentation
- [Quick Start](https://fastht.ml/docs/quickstart.md): How to set up FastHTML
- [API Reference](https://fastht.ml/docs/api.md): Full API details
- [Tutorials](https://fastht.ml/docs/tutorials.md): Step-by-step guides

## Community
- [Forum](https://fastht.ml/community.md): Ask questions, share feedback
- [Changelog](https://fastht.ml/changelog.md): View recent changes

## Optional
- [Why FastHTML?](https://fastht.ml/about.md): Key advantages and use cases
```

## Specification Compliance

This output follows the [llmstxt.org specification](https://llmstxt.org):

✅ **H1 Header (Required)**: `# FastHTML`  
✅ **Blockquote (Optional)**: `> FastHTML helps developers...`  
✅ **H2 Sections**: `## Documentation`, `## Community`, etc.  
✅ **Markdown Links**: `- [Title](url): Description`  
✅ **Clean Format**: Easy for both humans and LLMs to parse

## Content-Type

The API route handler automatically sets the correct headers:

```
Content-Type: text/markdown; charset=utf-8
Cache-Control: public, max-age=3600, s-maxage=3600
```

This ensures:
- Browsers display it as markdown/plain text
- Content is cached for 1 hour for better performance
- Character encoding is properly specified

## Best Practices

When creating your llms.txt configuration:

1. **Keep it focused**: Include only the most important resources
2. **Use descriptive titles**: Help LLMs understand the content
3. **Add descriptions**: Provide context for each link
4. **Link to markdown**: When possible, link to `.md` versions of your docs
5. **Organize logically**: Group related items into sections
6. **Update regularly**: Keep it in sync with your actual documentation
