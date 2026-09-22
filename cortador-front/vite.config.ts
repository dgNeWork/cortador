/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Configuración de Vitest (el motor de tests, reutiliza este mismo Vite).
  test: {
    // Simula un navegador (document, window...) para poder testear componentes.
    environment: 'jsdom',
    // Se ejecuta antes de cada archivo de test, ver src/test/setup.ts.
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      // Formato que luego lee SonarCloud para mostrar la cobertura real.
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/**/*.d.ts'],
    },
  },
})
