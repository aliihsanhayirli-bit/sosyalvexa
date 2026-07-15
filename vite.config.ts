import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
// @ts-expect-error - JS module, no declaration file
import { apiPlugin } from './vite/api-plugin.js';

export default defineConfig({
  plugins: [react(), apiPlugin() as never],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    hmr: {
      port: 5174,
      host: 'localhost',
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          pocketbase: ['pocketbase'],
          gemini: ['@google/generative-ai'],
        },
      },
    },
  },
});
