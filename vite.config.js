import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-pageflip'],
    force: true,
    esbuildOptions: {
      plugins: [],
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})