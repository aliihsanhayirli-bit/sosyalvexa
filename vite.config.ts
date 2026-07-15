import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
// @ts-expect-error - JS module, no declaration file
import { apiPlugin } from './vite/api-plugin.js';

const STAGING = process.env.VITE_STAGING === '1';

export default defineConfig({
  define: {
    __STAGING__: JSON.stringify(STAGING),
  },
  plugins: [
    react(),
    apiPlugin() as never,
    {
      name: 'yca-staging-banner',
      transformIndexHtml(html) {
        if (!STAGING) return html;
        const banner = `<div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#f59e0b;color:#000;text-align:center;padding:8px;font-weight:700;font-family:system-ui;font-size:13px;letter-spacing:0.05em;border-bottom:2px solid #b45309">⚠ STAGING — Canlıya yansımaz, sadece test amaçlıdır</div><style>body{padding-top:32px !important}</style>`;
        return html.replace('<head>', `<head>${banner}`);
      },
    },
  ],
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
