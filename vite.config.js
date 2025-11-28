// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // listen on 0.0.0.0 so ngrok can reach it
    allowedHosts: ['d4f4e4431208.ngrok-free.app'], // 👈 NO https:// here
    proxy: {
      '/api': {
        target: 'https://sparlike-neurally-pa.ngrok-free.dev',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
})
