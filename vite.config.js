// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://sparlike-neurally-pa.ngrok-free.dev', // make sure this is the working URL
        changeOrigin: true,
        secure: true, // https -> true
        rewrite: (path) => path.replace(/^\/api/, ''), // /api/log/ -> /log/
        headers: {
          'ngrok-skip-browser-warning': 'true', // 👈 THIS IS THE IMPORTANT PART
        },
      },
    },
  },
})
