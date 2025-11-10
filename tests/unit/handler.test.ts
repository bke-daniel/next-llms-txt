import { createLLMsTxtHandlers } from '../../src/handler';
import type { LLMsTxtConfig } from '../../src/types';

// Mock Next.js types for testing
const mockRequest = {
  url: 'http://localhost:3000/llms.txt',
  method: 'GET'
} as any;

describe('createLLMsTxtHandlers', () => {
  it('should create handlers with valid config', () => {
    const config: LLMsTxtConfig = {
      title: 'Test Project',
      description: 'Test description'
    };

    const handlers = createLLMsTxtHandlers(config);
    
    expect(handlers).toHaveProperty('GET');
    expect(typeof handlers.GET).toBe('function');
  });

  it('should throw error when title is missing', () => {
    const config = {
      description: 'Test description'
    } as any;

    expect(() => createLLMsTxtHandlers(config)).toThrow();
  });

  it('should handle handler config with defaultConfig', () => {
    const handlerConfig = {
      defaultConfig: {
        title: 'Test Project',
        description: 'Test description'
      }
    };

    const handlers = createLLMsTxtHandlers(handlerConfig);
    
    expect(handlers).toHaveProperty('GET');
    expect(typeof handlers.GET).toBe('function');
  });

  it('should throw error when handler config has no defaultConfig', () => {
    const handlerConfig = {
      someOtherProperty: true
    } as any;

    expect(() => createLLMsTxtHandlers(handlerConfig)).toThrow('LLMs.txt configuration must have a title');
  });

  describe('GET handler', () => {
    it('should return NextResponse with correct content type and content', async () => {
      const config: LLMsTxtConfig = {
        title: 'Test Project',
        description: 'A test project',
        sections: [
          {
            title: 'Documentation',
            items: [
              {
                title: 'Guide',
                url: '/guide'
              }
            ]
          }
        ]
      };

      const { GET } = createLLMsTxtHandlers(config);
      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
      
      const content = await response.text();
      expect(content).toContain('# Test Project');
      expect(content).toContain('> A test project');
      expect(content).toContain('## Documentation');
      expect(content).toContain('- [Guide](/guide)');
    });

    it('should handle minimal config', async () => {
      const config: LLMsTxtConfig = {
        title: 'Minimal Project'
      };

      const { GET } = createLLMsTxtHandlers(config);
      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      
      const content = await response.text();
      expect(content).toBe('# Minimal Project\n');
    });
  });
});