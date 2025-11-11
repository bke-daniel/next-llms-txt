import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  tsconfig: './tsconfig.json',
  dts: true,
  splitting: false,
  external: ['react', 'react-dom', 'next', '@babel/parser', '@babel/traverse', '@babel/generator', '@babel/types', 'debug'],
  noExternal: [],
  sourcemap: true,
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
})
