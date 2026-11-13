// Datos de las páginas /ofertas/<súper>/ (una por cadena de CATALOG_OFFERS): se
// consultan UNA vez al compilar y quedan escritos en el HTML (lo que lee
// Google) y en su datos.json. La web se recompila sola tras cada sync del
// catálogo (ver comparador-web), así que las páginas se renuevan cada semana.
//
// Las ofertas salen de la misma consulta que la vista de súper del comparador
// (fetchStoreProducts con offersOnly) en el CP de referencia de la cadena
// (REFERENCE_CP): así Lidl, BM, Consum o Plusfresc usan su tienda o zona de
// referencia, igual que el resto de páginas generadas.

import { REFERENCE_CP } from '../data/comparadorZonas.js';
import { TABLES, apiConfigured, fetchCategoryTree, fetchStoreProducts, restAll, toProduct, valid } from './comparadorApi.js';
import { KIND_ORDER, byDiscount, packOffer } from './ofertas.js';
import { DROP_COLS, dropsSince, parseDrop } from './bajadas.js';

const PAGE = 1000;
const RETRIES = 3;

// Raíces que agrupan por campaña, no por tipo de producto: solo se usan si el
// producto no está en ninguna otra.
const THEMATIC = /novedad|navidad|nadal|km ?0|solidari|ofert|promo|black friday|ahorro|estalvi|dietas|intoleranc|temporada|especial/i;

// Ofertas sin categoría raíz conocida.
const OTHER = 'otros';

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

/** Categoría (de cualquier nivel) → id de su raíz. */
async function rootMap(store, cp, tree) {
  const map = new Map();
  for (const root of tree) {
    map.set(root.id, root.id);
    for (const child of root.children) map.set(child.id, root.id);
  }
  // Niveles más profundos: se sube por parent_id (Lidl no tiene tabla propia).
  if (store !== 'lidl' && store !== 'mercadona') {
    const rows = await withRetries(() => restAll(`${TABLES[store]}_categories?select=id,parent_id&order=id`));
    const parent = new Map(rows.map((r) => [String(r.id), r.parent_id == null ? null : String(r.parent_id)]));
    for (const id of parent.keys()) {
      if (map.has(id)) continue;
      let node = id;
      for (let depth = 0; node && !map.has(node) && depth < 10; depth += 1) node = parent.get(node);
      if (node && map.has(node)) map.set(id, map.get(node));
    }
  }
  return map;
}

// mode: 'ofertas' (promociones) o 'bajadas' (precio más bajo que la semana pasada).
async function load(store, mode = 'ofertas') {
  const drops = mode === 'bajadas';
  if (!apiConfigured) {
    throw new Error('Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY: no se pueden generar las páginas de /ofertas/.');
  }
  const cp = REFERENCE_CP[store];
  const [treeEs, treeCa] = await Promise.all([
    withRetries(() => fetchCategoryTree(store, cp, undefined, 'es')),
    withRetries(() => fetchCategoryTree(store, cp, undefined, 'ca')),
  ]);
  // Algunas cadenas publican las categorías en minúscula («alimentacion»).
  const cap = (s) => s.charAt(0).toLocaleUpperCase('es') + s.slice(1);
  const roots = new Map(treeEs.map((r) => [r.id, { es: cap(r.name), ca: cap(treeCa.find((c) => c.id === r.id)?.name ?? r.name) }]));
  const rootOf = await rootMap(store, cp, treeEs);

  // Mercadona guarda una sola categoría (category_id); el resto, la lista.
  const catCol = store === 'mercadona' ? 'category_id' : 'category_ids';
  // Todas las ofertas, de 1.000 en 1.000 (con ambos idiomas en la misma fila).
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const res = await withRetries(() => fetchStoreProducts({
      store, cp, order: 'price', offset, limit: PAGE, lang: 'ca',
      ...(drops ? { dropsFrom: dropsSince(), extraCols: `${catCol},${DROP_COLS}` } : { offersOnly: true, extraCols: catCol }),
    }));
    rows.push(...res.rows);
    if (res.rowCount < PAGE) break;
  }

  const seen = new Set();
  const items = [];
  for (const r of rows) {
    const es = toProduct(store, r, cp, 'es');
    // En bajadas manda el historial: precio de ahora frente al de antes.
    const drop = drops ? parseDrop(r) : null;
    if ((drops ? !drop : !es.offer) || !valid(es) || seen.has(es.id)) continue;
    seen.add(es.id);
    const ca = toProduct(store, r, cp, 'ca');
    const ppu = drop && es.ppu != null && es.price > 0 ? Math.round(es.ppu * (drop.price / es.price) * 100) / 100 : es.ppu;
    const rootIds = [...new Set((r.category_ids ?? (r.category_id != null ? [r.category_id] : [])).map((id) => rootOf.get(String(id))).filter(Boolean))];
    const rootId = rootIds.find((id) => !THEMATIC.test(roots.get(id)?.es ?? '')) ?? rootIds[0] ?? OTHER;
    items.push({
      id: es.id,
      store,
      name: { es: es.label, ca: ca.label },
      format: es.format,
      image: es.image,
      category: roots.has(rootId) ? rootId : OTHER,
      offer: drops ? { es: drop, ca: drop } : { es: es.offer, ca: ca.offer ?? es.offer },
      ppu,
      unit: es.unit,
    });
  }

  const counts = Object.fromEntries(KIND_ORDER.map((k) => [k, items.filter((i) => i.offer.es.kind === k).length]));
  const categories = [...new Set(items.map((i) => i.category))]
    .map((id) => ({
      id,
      name: roots.get(id) ?? { es: 'Otros', ca: 'Altres' },
      count: items.filter((i) => i.category === id).length,
    }))
    // «Otros» siempre al final.
    .sort((a, b) => (a.id === OTHER) - (b.id === OTHER) || b.count - a.count);
  const top = items
    .filter((i) => i.offer.es.pct >= (drops ? 1 : 10))
    .sort((a, b) => b.offer.es.pct - a.offer.es.pct || a.offer.es.price - b.offer.es.price)
    .slice(0, 12);

  // Todas las ofertas, compactas y en el orden por defecto (datos.json).
  const packed = items.map(packOffer);
  const sortKey = (r) => ({ pct: r.d ?? 0, kind: r.k, name: r.n });
  packed.sort((a, b) => byDiscount(sortKey(a), sortKey(b)));

  return {
    store,
    // Fecha de la compilación: las páginas se regeneran tras cada sync.
    updated: new Date().toISOString().slice(0, 10),
    total: items.length,
    counts,
    categories,
    top: top.map(packOffer),
    rows: packed,
  };
}

const cache = new Map();

function cached(store, mode) {
  const key = `${mode}:${store}`;
  if (!cache.has(key)) cache.set(key, load(store, mode).catch((error) => { cache.delete(key); throw error; }));
  return cache.get(key);
}

/** Ofertas vigentes de un súper. Una sola carga por compilación. */
export const loadOfertas = (store) => cached(store, 'ofertas');

/** Productos que han bajado de precio esta semana. Una sola carga por compilación. */
export const loadBajadas = (store) => cached(store, 'bajadas');
