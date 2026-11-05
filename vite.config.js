import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => ({
  root: 'src',
  publicDir: '../public',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  appType: 'spa',
  base: mode === 'production' ? '/bulls-and-cows/' : '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
}));
