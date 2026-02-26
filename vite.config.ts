import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative paths so it works on GitHub Pages / OSS / any sub-path.
  base: './',
  plugins: [react()],
})







