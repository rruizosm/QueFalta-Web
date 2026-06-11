// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Sitio estático (output por defecto). El despliegue es en Vercel.
// La ruta /join/:id se sirve con un rewrite definido en vercel.json.
// La landing (/) usa una isla React para los mockups del teléfono.
export default defineConfig({
  site: 'https://quefalta.es',
  integrations: [react()],
});
