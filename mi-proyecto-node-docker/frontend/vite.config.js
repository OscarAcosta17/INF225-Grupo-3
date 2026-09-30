import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Esto es necesario para Docker
    proxy: {
      '/api': 'http://app:3000' // <-- ¡Magia de Docker! Llamamos al contenedor por su nombre
    }
  }
})