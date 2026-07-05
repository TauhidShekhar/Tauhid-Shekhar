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
  }
})
