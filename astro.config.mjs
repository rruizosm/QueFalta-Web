// @ts-check
import { defineConfig } from 'astro/config';

// Sitio estático (output por defecto). El despliegue es en Vercel.
// La ruta /join/:id se sirve con un rewrite definido en vercel.json.
export default defineConfig({
  site: 'https://quefalta.es',
});
