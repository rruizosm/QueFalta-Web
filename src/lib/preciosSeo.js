// Datos de las páginas /precios/: se consultan UNA vez al compilar la web y
// quedan escritos en el HTML (lo que lee Google). Sin datos, la compilación
// falla a propósito: Amplify mantiene la versión anterior publicada, que es
// mejor que publicar páginas vacías.

import { apiConfigured, norm, searchStore } from './comparadorApi.js';
import { MIN_STORES, PRODUCTS } from '../data/preciosProductos.js';
import { REFERENCE_CP } from '../data/comparadorZonas.js';

const STORES = Object.keys(REFERENCE_CP);
const CONCURRENCY = 4;
const RETRIES = 3;
const SEARCH_LIMIT = 60;

const tokens = (name) => norm(name).replace(/[^a-z0-9ñ]+/g, ' ').split(/\s+/).filter(Boolean);

/** ¿Este resultado es de verdad el producto de la página? */
export function matches(item, config) {
  if (item.unit !== config.unit || item.ppu == null) return false;
  if (item.ppu < config.range[0] || item.ppu > config.range[1]) return false;
  const words = tokens(item.name);
  const hasWord = (w) => words.some((t) => t === w || t.startsWith(w));
  if (!config.must.every(hasWord)) return false;
  return !config.not.some((w) => words.includes(w));
}

async function withRetries(fn) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= RETRIES) throw error;
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }
}

/** Ejecuta las tareas de pocas en pocas: la base de datos también sirve a la app. */
async function pool(tasks, size) {
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < tasks.length) {
      const task = tasks[next];
      next += 1;
      await task();
    }
  }));
}

function summarize(config, offers) {
  const rows = [...offers].sort((a, b) => a.ppu - b.ppu || a.price - b.price);
  const best = rows[0];
  const worst = rows[rows.length - 1];
  const average = rows.reduce((sum, r) => sum + r.ppu, 0) / rows.length;
  return {
    ...config,
    rows,
    best,
    worst,
    average,
    spreadPct: Math.round(((worst.ppu - best.ppu) / worst.ppu) * 100),
  };
}

async function load() {
  if (!apiConfigured) {
    throw new Error('Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY: no se pueden generar las páginas de /precios/.');
  }
  const offers = new Map(PRODUCTS.map((p) => [p.slug, []]));
  let failures = 0;
  const tasks = PRODUCTS.flatMap((config) => STORES.map((store) => async () => {
    try {
      const items = await withRetries(() => searchStore(store, config.query, REFERENCE_CP[store], { limit: SEARCH_LIMIT }));
      const cheapest = items.filter((i) => matches(i, config)).sort((a, b) => a.ppu - b.ppu || a.price - b.price)[0];
      if (cheapest) offers.get(config.slug).push(cheapest);
    } catch {
      failures += 1;
    }
  }));
  await pool(tasks, CONCURRENCY);
  const total = tasks.length;
  if (failures > total * 0.1) throw new Error(`/precios/: fallaron ${failures} de ${total} consultas al catálogo.`);
  return {
    updated: new Date().toISOString().slice(0, 10),
    failures,
    products: PRODUCTS
      .filter((p) => offers.get(p.slug).length >= MIN_STORES)
      .map((p) => summarize(p, offers.get(p.slug))),
  };
}

let cached = null;

/** Todos los productos publicables. Una sola carga por compilación. */
export function loadPrecios() {
  cached ??= load().catch((error) => { cached = null; throw error; });
  return cached;
}
