import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Determine base path dynamically (use root '/' for Vercel, '/admin/' for Render backend)
const isVercel = process.env.VERCEL === '1' || process.env.VITE_DEPLOY_TARGET === 'vercel';

export default defineConfig({
  base: isVercel ? '/' : '/admin/',
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5174
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          if (id.includes('node_modules/react-icons')) {
            return 'icons';
          }
        }
      }
    },
    cssCodeSplit: true,
    sourcemap: false
  }
})
