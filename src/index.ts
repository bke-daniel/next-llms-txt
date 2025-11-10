/**
 * next-llms-txt - A Next.js plugin for generating llms.txt files
 * 
 * This package helps you generate llms.txt files following the llmstxt.org specification.
 * It provides an API route handler similar to Auth.js for easy integration.
 */

// Export types
export type {
  LLMsTxtConfig,
  LLMsTxtSection,
  LLMsTxtItem,
  LLMsTxtHandlerConfig,
} from './types';

// Export generator
export { generateLLMsTxt } from './generator';

// Export handler creators
export { createLLMsTxtHandlers, handlers } from './handler';
