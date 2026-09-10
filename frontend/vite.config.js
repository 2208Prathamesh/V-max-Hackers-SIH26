import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['recharts', 'lucide-react', 'leaflet', 'react-leaflet']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks (id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
            if (id.includes('leaflet')) return 'vendor-leaflet'
            if (id.includes('recharts')) return 'vendor-recharts'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('i18next')) return 'vendor-i18n'
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
