import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// host: true lets you open the app on your phone over the same Wi-Fi
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
})
