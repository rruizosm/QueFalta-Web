// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Sitio estático (output por defecto). El despliegue es en AWS Amplify.
// La ruta /join/:id se sirve con un rewrite (200) configurado en la consola
// de Amplify; el Content-Type del AASA lo fija customHttp.yml.
// La landing (/) usa una isla React para los mockups del teléfono.
export default defineConfig({
  site: 'https://quefalta.es',
  integrations: [
    react(),
    // Las páginas-puente /join/:id y la de error 404 no se indexan (van con
    // noindex), así que tampoco entran en el sitemap.
    sitemap({ filter: (page) => !page.includes('/join') && !page.includes('/404') }),
  ],
});
