import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',  // For GitHub Pages
  server: {
    port: 5176,
    strict: false,
    cors: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Remove manualChunks since we're using CDN/importmap
      }
    }
  }
});