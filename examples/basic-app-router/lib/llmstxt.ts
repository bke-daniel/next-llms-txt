import { createLLMsTxtHandlers } from 'next-llms-txt';

export const { GET } = createLLMsTxtHandlers({
  title: "My Next.js App",
  description: "A modern web application built with Next.js",
  sections: [
    {
      title: "Documentation",
      items: [
        {
          title: "Getting Started",
          url: "/docs/getting-started",
          description: "Learn how to set up and use the app"
        },
        {
          title: "API Reference",
          url: "/docs/api",
          description: "Complete API documentation"
        },
        {
          title: "Tutorials",
          url: "/docs/tutorials",
          description: "Step-by-step guides"
        }
      ]
    },
    {
      title: "Examples",
      items: [
        {
          title: "Basic Usage",
          url: "/examples/basic",
          description: "Simple example to get started"
        },
        {
          title: "Advanced Features",
          url: "/examples/advanced",
          description: "Explore advanced functionality"
        }
      ]
    },
    {
      title: "Resources",
      items: [
        {
          title: "GitHub Repository",
          url: "https://github.com/yourusername/yourproject"
        },
        {
          title: "Community Forum",
          url: "/community",
          description: "Get help and share knowledge"
        },
        {
          title: "Changelog",
          url: "/changelog",
          description: "See what's new"
        }
      ]
    }
  ]
});
