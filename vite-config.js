import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.', // Explicitly set root
  base: '',
  server: {
    port: 5176,
    strict: false,
    cors: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});