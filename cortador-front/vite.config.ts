/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { siteConfig } from './src/config/site.ts'

// Escribe el nombre del negocio (de config/site.ts) en el <title> del
// index.html, que es lo que se ve en la pestaña del navegador. Se hace
// aquí, al servir/compilar, y no desde React, para que el nombre ya venga
// en el HTML: es lo que leen Google o WhatsApp al compartir el enlace.
// Así site.ts sigue siendo el único sitio donde se cambia el nombre.
function siteTitlePlugin(): Plugin {
  // Por si el nombre lleva caracteres especiales de HTML (p. ej. "&").
  const escapedName = siteConfig.businessName
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

  return {
    name: 'site-title',
    transformIndexHtml: (html) => html.replace(/<title>.*<\/title>/, `<title>${escapedName}</title>`),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), siteTitlePlugin()],
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
