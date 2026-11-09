// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Sitio estático (output por defecto). El despliegue es en AWS Amplify.
// La ruta /join/:id se sirve con un rewrite (200) configurado en la consola
// de Amplify; el Content-Type del AASA lo fija customHttp.yml.
// La home (/) es el comparador y /como-funciona/ la presentación de la app, ambas
// con islas React. /precios/ se genera con datos de Supabase al compilar.
export default defineConfig({
  site: 'https://quefalta.es',
  // Coincide con las URLs de directorio que Amplify ya sirve y redirige.
  trailingSlash: 'always',
  integrations: [
    react(),
    // Las páginas-puente y la de error 404 no se indexan (van con noindex),
    // así que tampoco entran en el sitemap.
    // Las páginas base de fichas (/producto/, /ca/producte/) tampoco: solo son el
    // contenedor de las fichas que se pintan en el navegador.
    sitemap({
      filter: (page) => !page.includes('/join') && !page.includes('/inicio') && !page.includes('/404')
        && !page.endsWith('/producto/') && !page.includes('/ca/producte/'),
    }),
  ],
});
