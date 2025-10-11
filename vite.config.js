// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.201.132.235:8000', // backend URL
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '') // remove /api before sending to backend
      },
    },
  },
})
