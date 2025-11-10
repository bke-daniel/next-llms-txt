import fs from 'fs';
import path from 'path';
import { generateLLMsTxt } from '../../src/generator';
import type { LLMsTxtConfig } from '../../src/types';

describe('Static Generation Tests', () => {
  const outputDir = path.join(__dirname, 'output');
  const outputFile = path.join(outputDir, 'llms.txt');

  beforeAll(() => {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    if (fs.existsSync(outputDir)) {
      fs.rmdirSync(outputDir);
    }
  });

  it('should generate llms.txt file that can be written to filesystem', () => {
    const config: LLMsTxtConfig = {
      title: 'Static Generation Test',
      description: 'Testing static file generation',
      sections: [
        {
          title: 'Static Content',
          items: [
            {
              title: 'Generated File',
              url: '/static/file.txt',
              description: 'A statically generated file'
            }
          ]
        }
      ]
    };

    const content = generateLLMsTxt(config);
    
    // Write to file (simulating static generation)
    fs.writeFileSync(outputFile, content, 'utf-8');
    
    // Verify file was created and has correct content
    expect(fs.existsSync(outputFile)).toBe(true);
    
    const fileContent = fs.readFileSync(outputFile, 'utf-8');
    expect(fileContent).toBe(content);
    expect(fileContent).toContain('# Static Generation Test');
  });

  it('should generate valid file that matches llms.txt specification', () => {
    const config: LLMsTxtConfig = {
      title: 'Specification Test',
      description: 'Testing compliance with llmstxt.org specification',
      sections: [
        {
          title: 'Documentation',
          items: [
            {
              title: 'Setup Guide',
              url: '/docs/setup'
            },
            {
              title: 'API Reference',
              url: '/docs/api',
              description: 'Complete API documentation'
            }
          ]
        },
        {
          title: 'Examples',
          items: [
            {
              title: 'Basic Example',
              url: '/examples/basic'
            }
          ]
        }
      ]
    };

    const content = generateLLMsTxt(config);
    fs.writeFileSync(outputFile, content, 'utf-8');
    
    const lines = content.split('\n');
    
    // Verify specification compliance
    // 1. First line must be H1 title
    expect(lines[0]).toBe('# Specification Test');
    
    // 2. Second line should be empty
    expect(lines[1]).toBe('');
    
    // 3. Third line should be blockquote description
    expect(lines[2]).toBe('> Testing compliance with llmstxt.org specification');
    
    // 4. Sections should be H2 headers
    expect(content).toContain('## Documentation');
    expect(content).toContain('## Examples');
    
    // 5. Items should be markdown links in lists
    expect(content).toContain('- [Setup Guide](/docs/setup)');
    expect(content).toContain('- [API Reference](/docs/api): Complete API documentation');
    expect(content).toContain('- [Basic Example](/examples/basic)');
  });

  it('should create file with proper encoding and line endings', () => {
    const config: LLMsTxtConfig = {
      title: 'Encoding Test with Special Characters: àáâãäåæçèéêë',
      description: 'Testing UTF-8 encoding: 中文 한국어 العربية'
    };

    const content = generateLLMsTxt(config);
    fs.writeFileSync(outputFile, content, 'utf-8');
    
    const readContent = fs.readFileSync(outputFile, 'utf-8');
    
    expect(readContent).toBe(content);
    expect(readContent).toContain('àáâãäåæçèéêë');
    expect(readContent).toContain('中文 한국어 العربية');
  });

  it('should handle large configurations efficiently', () => {
    // Generate a large configuration
    const sections = Array.from({ length: 100 }, (_, i) => ({
      title: `Section ${i + 1}`,
      items: Array.from({ length: 50 }, (_, j) => ({
        title: `Item ${j + 1} in Section ${i + 1}`,
        url: `/section-${i + 1}/item-${j + 1}`,
        description: `Description for item ${j + 1} in section ${i + 1}`
      }))
    }));

    const config: LLMsTxtConfig = {
      title: 'Large Configuration Test',
      description: 'Testing with 100 sections and 50 items each (5000 total items)',
      sections
    };

    const startTime = Date.now();
    const content = generateLLMsTxt(config);
    const endTime = Date.now();
    
    // Should complete within reasonable time (1 second)
    expect(endTime - startTime).toBeLessThan(1000);
    
    fs.writeFileSync(outputFile, content, 'utf-8');
    
    // Verify structure is correct
    expect(content).toContain('# Large Configuration Test');
    expect(content).toContain('## Section 1');
    expect(content).toContain('## Section 100');
    expect(content).toContain('- [Item 1 in Section 1](/section-1/item-1): Description for item 1 in section 1');
    expect(content).toContain('- [Item 50 in Section 100](/section-100/item-50): Description for item 50 in section 100');
  });
});