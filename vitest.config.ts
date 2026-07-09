import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // Match Next's automatic JSX runtime so component tests (.tsx) don't need
  // `import React` in every file under test.
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
});
