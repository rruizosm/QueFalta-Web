// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Sitemap de imágenes: cada ficha generada declara su foto, la misma URL que
// lleva el schema Product (ver pages/producto/[store]/[id].astro). Se lee del
// HTML ya compilado: el sitemap se escribe al final de la compilación.
const DIST = new URL('./dist/', import.meta.url);
const LD_JSON = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
const NOINDEX = /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/;

async function readPage(pageUrl) {
  const path = new URL(pageUrl).pathname;
  try {
    return await readFile(fileURLToPath(new URL(`.${decodeURI(path)}index.html`, DIST)), 'utf8');
  } catch {
    return '';
  }
}

function productImage(pageUrl, html) {
  if (!/^\/producto\/[^/]+\/[^/]+\/$/.test(new URL(pageUrl).pathname)) return null;
  try {
    for (const [, json] of html.matchAll(LD_JSON)) {
      const data = JSON.parse(json);
      if (data['@type'] === 'Product' && typeof data.image === 'string') return data.image;
    }
  } catch { /* JSON-LD ilegible: sin imagen */ }
  return null;
}

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
      // Además, fuera toda página que salga con noindex. Algunas dependen de los
      // datos de la semana (ofertas o bajadas con pocos productos, ver
      // OfertasPage/BajadasPage) y no se pueden filtrar por la URL: devolver
      // undefined descarta la entrada.
      serialize: async (item) => {
        const html = await readPage(item.url);
        if (NOINDEX.test(html)) return undefined;
        const image = productImage(item.url, html);
        return image ? { ...item, img: [{ url: image }] } : item;
      },
    }),
  ],
});
