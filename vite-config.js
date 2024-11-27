import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
<<<<<<< HEAD
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
=======
  base: './',  // This is important for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap']
        }
      }
    }
>>>>>>> parent of 30d0862 (updates)
  }
});