/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { siteConfig } from './src/config/site.ts'

// Escapa los caracteres especiales de HTML (p. ej. "&" o comillas) para
// poder meter cualquier texto de site.ts dentro del index.html sin romperlo.
function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

// Escribe en el index.html el <title> (lo que se ve en la pestaña) y las
// etiquetas que leen Google y WhatsApp al compartir el enlace: descripción,
// título, imagen y dirección (las "og:" son el estándar Open Graph).
// Se hace aquí, al servir/compilar, y no desde React, porque esos
// programas leen el HTML tal cual llega, sin ejecutar JavaScript.
// Así site.ts sigue siendo el único sitio donde se cambian estos datos.
function siteMetaPlugin(): Plugin {
  const name = escapeHtml(siteConfig.businessName)
  const description = escapeHtml(siteConfig.description)
  const url = escapeHtml(siteConfig.siteUrl)
  // La imagen tiene que ir con la dirección completa: si en site.ts es
  // una ruta ("/images/..."), se le pone delante la dirección de la web.
  const image = escapeHtml(
    siteConfig.shareImageUrl.startsWith('http')
      ? siteConfig.shareImageUrl
      : `${siteConfig.siteUrl}${siteConfig.shareImageUrl}`,
  )

  const metaTags = [
    `<meta name="description" content="${description}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="es_ES" />`,
    `<meta property="og:site_name" content="${name}" />`,
    `<meta property="og:title" content="${name}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
  ].join('\n    ')

  return {
    name: 'site-meta',
    transformIndexHtml: (html) =>
      html.replace(/<title>.*<\/title>/, `<title>${name}</title>\n    ${metaTags}`),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), siteMetaPlugin()],
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
