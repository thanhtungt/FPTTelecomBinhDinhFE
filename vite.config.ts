import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  esbuild: {
    // Remove console logs only in production build
    drop: mode === 'production' ? ['console', 'debugger'] : []
  }
}))
