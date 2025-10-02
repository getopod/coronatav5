import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  css: {
    devSourcemap: true
  },
  build: {
    rollupOptions: {
      external: ['fs', 'path', 'os']
    },
    minify: 'esbuild',
    cssMinify: 'esbuild'
  },
  optimizeDeps: {
    exclude: ['fs', 'path', 'os']
  }
})
