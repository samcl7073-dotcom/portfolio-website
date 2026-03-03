import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wp-json': 'https://samanthaclai.com',
      '/wp-content': 'https://samanthaclai.com',
    },
  },
})
