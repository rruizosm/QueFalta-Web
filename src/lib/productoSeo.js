// Fichas de producto que se generan en HTML al compilar (las que se indexan).
//
// Hay ~235.000 productos: generarlos todos no cabe en una compilación. Se
// eligen los que aportan algo que no tiene la web de cada súper: el MISMO
// producto (mismo EAN) a la venta en al menos MIN_STORES cadenas, para poner la
// comparación exacta en el HTML. De cada EAN se publica UNA ficha (la cadena con
// la ficha más completa); las demás fichas existen igualmente, pero se pintan en
// el navegador y van con noindex (ver pages/producto/index.astro).
//
// Sin datos, la compilación falla a propósito, como en /precios/: Amplify
// mantiene la versión anterior publicada.

import { REFERENCE_CP, STORES } from '../data/comparadorZonas.js';
import { TABLES, apiConfigured, columnsFor, rest, restAll, toProduct, valid } from './comparadorApi.js';
import { EAN_STORES, detailColumns, detailScore, eanVariants, toDetail } from './productoApi.js';

export const MIN_STORES = 3;
const BATCH = 100;
const CONCURRENCY = 4;
const RETRIES = 3;
const STORE_ORDER = STORES.map((s) => s.key);

// Ficha de la cadena (no la de una tienda concreta) para Lidl y BM.
const tableOf = (store) => (store === 'lidl' ? 'lidl_products' : store === 'bm' ? 'bm_products' : `${TABLES[store]}_products`);

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

/** EAN normalizado (sin ceros a la izquierda) o null. */
const eanKey = (ean) => eanVariants(ean)[0] ?? null;

async function load() {
  if (!apiConfigured) {
    throw new Error('Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY: no se pueden generar las fichas de /producto/.');
  }

  // 1. Todos los productos con EAN, en ligero (sin ficha), agrupados por EAN.
  const groups = new Map(); // ean → Map(store → producto más barato)
  await pool(EAN_STORES.map((store) => async () => {
    const rows = await withRetries(() => restAll(
      `${tableOf(store)}?select=${columnsFor(store, 'es')},ean&published=eq.true&ean=not.is.null&order=id.asc`,
    ));
    for (const r of rows) {
      const key = eanKey(r.ean);
      if (!key) continue;
      const p = toProduct(store, r, REFERENCE_CP[store], 'es');
      if (!valid(p)) continue;
      if (!groups.has(key)) groups.set(key, new Map());
      const byStore = groups.get(key);
      if (!byStore.has(store) || p.price < byStore.get(store).price) byStore.set(store, { ...p, ean: r.ean });
    }
  }), CONCURRENCY);

  const shared = [...groups.entries()].filter(([, byStore]) => byStore.size >= MIN_STORES);

  // 2. Ficha completa de cada miembro, para elegir la mejor de cada EAN.
  const wanted = new Map(); // store → ids
  for (const [, byStore] of shared) {
    for (const [store, p] of byStore) {
      if (!wanted.has(store)) wanted.set(store, []);
      wanted.get(store).push(p.id);
    }
  }
  const details = new Map(); // uid → ficha
  const tasks = [];
  for (const [store, ids] of wanted) {
    for (let i = 0; i < ids.length; i += BATCH) {
      const chunk = ids.slice(i, i + BATCH);
      tasks.push(async () => {
        const list = encodeURIComponent(`(${chunk.map((id) => JSON.stringify(id)).join(',')})`);
        const rows = await withRetries(() => rest(`${tableOf(store)}?select=${detailColumns(store, 'es')}&id=in.${list}&published=eq.true`));
        for (const r of rows) {
          const d = toDetail(store, r, REFERENCE_CP[store], 'es');
          if (valid(d)) details.set(d.uid, d);
        }
      });
    }
  }
  await pool(tasks, CONCURRENCY);

  // 3. Una página por EAN: la ficha más completa; el resto, su comparación.
  const pages = [];
  for (const [, byStore] of shared) {
    const members = [...byStore.values()].map((p) => details.get(p.uid)).filter(Boolean);
    if (members.length < MIN_STORES) continue;
    members.sort((a, b) => detailScore(b) - detailScore(a) || STORE_ORDER.indexOf(a.store) - STORE_ORDER.indexOf(b.store));
    const [main, ...others] = members;
    // La comparación solo lleva lo que se pinta: nada de textos de ficha ajenos.
    const same = others
      .map(({ info, nutritionIndex, ...light }) => light)
      .sort((a, b) => a.price - b.price);
    pages.push({ store: main.store, id: main.id, detail: main, same });
  }

  if (!pages.length) throw new Error('/producto/: no ha salido ninguna ficha con el mismo EAN en varias cadenas.');
  return { updated: new Date().toISOString().slice(0, 10), pages };
}

let cached = null;

/** Fichas que se generan en HTML. Una sola carga por compilación. */
export function loadProductPages() {
  cached ??= load().catch((error) => { cached = null; throw error; });
  return cached;
}

/* ───────────────────── Enlazado interno de las fichas ───────────────────── */
// Google da poco valor a una página que solo está en el sitemap: cada ficha
// indexable recibe enlaces normales desde el directorio /productos/, desde la
// página de su cadena en /supermercados/ y desde fichas relacionadas.

const plain = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Letra del directorio: a-z, o «0-9» para lo que empieza por número o símbolo. */
export function letterOf(label) {
  const c = plain(label).trim().charAt(0);
  return /[a-z]/.test(c) ? c : '0-9';
}

/** Entrada ligera para listas de enlaces. */
export const linkItem = (page) => ({
  store: page.store,
  id: page.id,
  label: page.detail.label,
  price: page.detail.price,
  image: page.detail.image,
  stores: page.same.length + 1,
  low: Math.min(page.detail.price, ...page.same.map((s) => s.price)),
});

/** Directorio A-Z: [{ letter, items }] ordenado. */
export function productDirectory(pages) {
  const byLetter = new Map();
  for (const page of pages) {
    const letter = letterOf(page.detail.label);
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter).push(linkItem(page));
  }
  return [...byLetter.entries()]
    .map(([letter, items]) => ({ letter, items: items.sort((a, b) => a.label.localeCompare(b.label, 'es')) }))
    .sort((a, b) => (a.letter === '0-9' ? 1 : b.letter === '0-9' ? -1 : a.letter.localeCompare(b.letter)));
}

const groupsCache = new WeakMap();

/** Fichas agrupadas por categoría y por cadena, ya ordenadas (una vez por compilación). */
function groupsOf(pages) {
  if (!groupsCache.has(pages)) {
    const sorted = [...pages].sort((a, b) => a.detail.label.localeCompare(b.detail.label, 'es'));
    const byCategory = new Map();
    const byStore = new Map();
    for (const p of sorted) {
      const c = p.detail.category ?? '';
      if (!byCategory.has(c)) byCategory.set(c, []);
      byCategory.get(c).push(p);
      if (!byStore.has(p.store)) byStore.set(p.store, []);
      byStore.get(p.store).push(p);
    }
    groupsCache.set(pages, { byCategory, byStore });
  }
  return groupsCache.get(pages);
}

/** Los siguientes de la lista ordenada a partir de `page` (dando la vuelta). */
function after(list, page, limit, skip) {
  const out = [];
  const i = list.indexOf(page);
  for (let k = 1; k < list.length && out.length < limit; k += 1) {
    const p = list[(i + k) % list.length];
    if (p !== page && !skip.has(p)) out.push(p);
  }
  return out;
}

/**
 * Hasta `limit` fichas relacionadas: de la misma categoría y, si faltan, de la
 * misma cadena. Se toman las siguientes en orden alfabético, así cada ficha
 * enlaza a otras distintas y todas reciben enlaces.
 */
export function relatedPages(pages, page, limit = 8) {
  const { byCategory, byStore } = groupsOf(pages);
  const chosen = page.detail.category ? after(byCategory.get(page.detail.category) ?? [], page, limit, new Set()) : [];
  if (chosen.length < limit) chosen.push(...after(byStore.get(page.store) ?? [], page, limit - chosen.length, new Set(chosen)));
  return chosen.map(linkItem);
}
