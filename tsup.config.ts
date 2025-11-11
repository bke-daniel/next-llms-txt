import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  tsconfig: './tsconfig.json',
  dts: true,
  splitting: false,
  external: ['react'],
  sourcemap: true,
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
})
