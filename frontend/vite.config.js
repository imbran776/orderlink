import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'react-vendor'
            }
            if (id.includes('recharts')) {
              return 'chart-vendor'
            }
            if (id.includes('react-icons')) {
              return 'icon-vendor'
            }
            if (id.includes('socket.io-client')) {
              return 'socket-vendor'
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
