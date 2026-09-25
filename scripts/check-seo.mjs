// Valida el resultado estático, sin red ni cambios en los ficheros.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { STORES } from '../src/data/supermercados.js';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const origin = 'https://quefalta.es';
const read = (file) => readFile(path.join(dist, file), 'utf8');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const links = (html) => [...html.matchAll(/<link\b[^>]*>/g)].map((m) => attrs(m[0]));
const plain = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const schemas = (html) => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const fileForUrl = (url) => {
  const pathname = new URL(url).pathname;
  return pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : pathname.slice(1);
};

const sitemapIndex = await read('sitemap-index.xml');
const sitemapFiles = [...sitemapIndex.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => fileForUrl(m[1]));
const urls = [];
for (const file of sitemapFiles) {
  for (const match of (await read(file)).matchAll(/<loc>(.*?)<\/loc>/g)) urls.push(match[1]);
}
assert(urls.length > 0, 'El sitemap no puede estar vacío');
assert.equal(new Set(urls).size, urls.length, 'URLs duplicadas en sitemap');
const pages = new Map();
for (const url of urls) {
  assert.equal(new URL(url).origin, origin, `Host no canónico: ${url}`);
  assert(url.endsWith('/'), `Falta barra final: ${url}`);
  assert(!/\/(join|inicio|404)(\/|$)/.test(new URL(url).pathname), `Página no indexable en sitemap: ${url}`);
  const html = await read(fileForUrl(url));
  pages.set(url, html);
  const canonical = links(html).filter((l) => l.rel === 'canonical');
  assert.equal(canonical.length, 1, `Canonical ausente o duplicado: ${url}`);
  assert.equal(canonical[0].href, url, `Canonical distinto del sitemap: ${url}`);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `Se esperaba un H1: ${url}`);
  assert(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html), `Noindex en sitemap: ${url}`);
  assert(schemas(html).length >= 2, `Faltan datos de identidad: ${url}`);
}
for (const [url, html] of pages) {
  for (const alternate of links(html).filter((l) => l.rel === 'alternate' && l.hreflang)) {
    assert(pages.has(alternate.href), `Alternativa fuera del sitemap: ${alternate.href}`);
    assert(links(pages.get(alternate.href)).some((l) => l.rel === 'alternate' && l.href === url), `Hreflang no recíproco: ${url} → ${alternate.href}`);
  }
}
for (const store of STORES) {
  const url = `${origin}/supermercados/${store.slug}/`;
  const html = pages.get(url);
  assert(html, `Falta la página de ${store.name}`);
  const data = schemas(html);
  const crumbs = data.find((s) => s['@type'] === 'BreadcrumbList');
  assert.equal(crumbs?.itemListElement.at(-1).item, url, `Ruta estructurada incorrecta: ${url}`);
  const faq = data.find((s) => s['@type'] === 'FAQPage');
  const visible = plain(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''));
  assert.equal(faq?.mainEntity.length, store.faqs.length, `FAQ incompleta: ${url}`);
  for (const question of faq.mainEntity) {
    assert(visible.includes(plain(question.name)), `Pregunta no visible: ${url}`);
    assert(visible.includes(plain(question.acceptedAnswer.text)), `Respuesta no visible: ${url}`);
  }
}

const bonpreu = pages.get(`${origin}/supermercados/bonpreu/`);
assert.equal([...bonpreu.matchAll(/<h3[^>]*>/g)].length, 10, 'Bonpreu: faltan pasos o respuestas');
assert(bonpreu.includes('no es la tienda online ni el folleto oficial'), 'Bonpreu: falta distinguir la app de la tienda oficial');
const home = pages.get(`${origin}/`);
assert(plain(home.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '').includes('Tu lista de la compra, compartida'), 'Falta el H1 de lista compartida');
assert(home.includes('¿Podemos compartir la lista entre iPhone y Android?'), 'Falta el contenido entre plataformas');
assert(home.includes('Lidl requiere Plus'), 'La portada debe explicar el acceso a Lidl');
for (const url of [`${origin}/`, `${origin}/supermercados/bonpreu/`]) {
  const html = pages.get(url);
  for (const match of html.matchAll(/<a\b[^>]*href="(\/[^"]*)"/g)) {
    const target = new URL(match[1], origin);
    if (target.pathname.startsWith('/join/')) continue;
    const pathname = target.pathname.endsWith('/') ? target.pathname : `${target.pathname}/`;
    await access(path.join(dist, pathname.slice(1), 'index.html'));
  }
}
for (const file of ['join/index.html', 'inicio/index.html', '404.html']) {
  assert(/name="robots"[^>]*content="[^"]*noindex/.test(await read(file)), `Falta noindex: ${file}`);
}
const aasa = JSON.parse(await read('.well-known/apple-app-site-association'));
const aasaJson = JSON.parse(await read('.well-known/apple-app-site-association.json'));
assert.deepEqual(aasaJson, aasa, 'Las dos copias del AASA deben ser idénticas');
const components = aasa.applinks?.details?.flatMap((detail) => detail.components ?? []) ?? [];
for (const route of ['/join/*', '/inicio', '/inicio/*']) {
  assert(components.some((component) => component['/'] === route), `Falta la ruta AASA: ${route}`);
}
JSON.parse(await read('.well-known/assetlinks.json'));
console.log(`SEO OK: ${pages.size} URLs de sitemap, ${STORES.length} supermercados, canonicals, hreflang, FAQ visible, enlaces y asociación de apps.`);
