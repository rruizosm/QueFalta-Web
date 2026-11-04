// Acceso a los catálogos de Supabase para el comparador web (home).
// Usa SOLO lo que ya es público para el rol anon: las RPC `search_*_products`
// que también usa la app (relevancia, tolerancia a erratas, filtro por
// comunidad/centro antes de paginar) y dos tablas de resolución de tienda
// (BM, Lidl). Sin supabase-js: son POST/GET planos a PostgREST.

import {
  REGION_CATALOG_NAME, regionFromPostalCode, consumZone, plusfrescCenter, bmReferencePostalCode,
} from '../data/comparadorZonas.js';
import { catalanToSpanish } from '../data/glosarioCatala.js';

const URL_BASE = import.meta.env.PUBLIC_SUPABASE_URL;
const ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const apiConfigured = Boolean(URL_BASE && ANON_KEY);

const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function restResponse(path, { body, signal, headers } = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: headers ? { ...HEADERS, ...headers } : HEADERS,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path.split('?')[0]}`);
  return res;
}

const rest = async (path, options) => (await restResponse(path, options)).json();

/* ───────────────────────── Columnas por súper ───────────────────────── */

const BASE_COLS = 'id,display_name,thumbnail,unit_price,price_per_unit,price_per_unit_unit';
// `packaging` y `price_format` no existen en todas las tablas.
const WITH_PACKAGING = new Set(['ahorramas', 'alcampo', 'aldi', 'ametller', 'bm', 'esclat', 'condis', 'consum', 'eljamon', 'gadis', 'hiperdino', 'lidl', 'mercadona', 'sorli']);
const EXTRA_COLS = { carrefour: 'regional_prices', consum: 'regional_prices', plusfresc: 'center_prices' };

// Cadenas con catálogo propio en catalán: el resto solo tiene el castellano.
const CATALAN_PRODUCTS = new Set(['mercadona', 'esclat', 'bonarea', 'sorli', 'condis', 'ametller', 'plusfresc']);
const CATALAN_CATEGORIES = new Set(['esclat', 'bonarea', 'sorli', 'condis', 'ametller', 'plusfresc']);

function columnsFor(store, lang) {
  const cols = [BASE_COLS];
  if (lang === 'ca' && CATALAN_PRODUCTS.has(store)) cols.push('display_name_ca');
  if (store !== 'mercadona') cols.push('price_format');
  if (WITH_PACKAGING.has(store)) cols.push('packaging');
  if (EXTRA_COLS[store]) cols.push(EXTRA_COLS[store]);
  return cols.join(',');
}

const RPC = {
  mercadona: 'search_mercadona_products', carrefour: 'search_carrefour_products',
  dia: 'search_dia_products', aldi: 'search_aldi_products', alcampo: 'search_alcampo_products',
  consum: 'search_consum_products', eroski: 'search_eroski_products', esclat: 'search_bonpreu_products',
  bonarea: 'search_bonarea_products', sorli: 'search_sorli_products', caprabo: 'search_caprabo_products',
  condis: 'search_condis_products', ametller: 'search_ametller_products', plusfresc: 'search_plusfresc_products',
  gadis: 'search_gadis_products', froiz: 'search_froiz_products', ahorramas: 'search_ahorramas_products',
  hiperdino: 'search_hiperdino_products',
};

/* ───────────────────── Resolución de tienda por CP ───────────────────── */

const lidlStoreCache = new Map();
const bmLocationCache = new Map();

/** Tienda Lidl del CP con catálogo sincronizado. `find_lidl_stores` solo
 *  conoce los CP con tienda propia; si no hay, se usa la tienda con el CP
 *  numéricamente más cercano de la misma zona postal (3 y luego 2 dígitos). */
async function lookupLidlStore(cp, signal) {
  const exact = await rest('rpc/find_lidl_stores', { body: { p_postal_code: cp, p_limit: 3 }, signal });
  const hit = (exact ?? []).find((r) => r.catalog_synced_at);
  if (hit) return { id: hit.id, label: [hit.street, hit.city].filter(Boolean).join(', ') };
  for (const prefix of [cp.slice(0, 3), cp.slice(0, 2)]) {
    const rows = await rest(`lidl_stores?select=id,street,city,postal_code&published=eq.true&selectable=eq.true&postal_code=like.${prefix}*&limit=100`, { signal });
    if (rows?.length) {
      const near = rows.sort((a, b) => Math.abs(a.postal_code - cp) - Math.abs(b.postal_code - cp))[0];
      return { id: near.id, label: [near.street, near.city].filter(Boolean).join(', ') };
    }
  }
  return null;
}

function resolveLidlStore(cp, signal) {
  if (!lidlStoreCache.has(cp)) {
    const p = lookupLidlStore(cp, signal)
      .catch((e) => { lidlStoreCache.delete(cp); throw e; });
    lidlStoreCache.set(cp, p);
  }
  return lidlStoreCache.get(cp);
}

/** Ubicación BM del CP de referencia de la provincia (o null). */
function resolveBmLocation(cp, signal) {
  const ref = bmReferencePostalCode(cp);
  if (!ref) return Promise.resolve(null);
  if (!bmLocationCache.has(ref)) {
    const p = rest(`bm_postal_locations?select=location_id,is_preferred&postal_code=eq.${ref}&enabled=eq.true&order=is_preferred.desc&limit=1`, { signal })
      .then((rows) => rows?.[0]?.location_id ?? null)
      .catch((e) => { bmLocationCache.delete(ref); throw e; });
    bmLocationCache.set(ref, p);
  }
  return bmLocationCache.get(ref);
}

/* ───────────────────────────── Normalización ───────────────────────────── */

export const norm = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Cantidad total en l / kg / ud leída del texto ("6 x 1 l", "500 g", "12 uds").
 *  Solo se usa si la cadena no publica precio por unidad. */
function parseQuantity(text) {
  const t = norm(text).replace(/,/g, '.').replace(/\b(1\/2|media) docena\b/g, '6 uds');
  const m = t.match(/(?:(\d+)\s*x\s*)?(\d+(?:\.\d+)?)\s*(kg|kilos?|g|gr|grs|gramos|l|lt|litros?|ml|cl|uds?|u|unidades|rollos?|docenas?)\b/);
  if (!m) return null;
  const packs = m[1] ? Number(m[1]) : 1;
  let n = Number(m[2]) * packs;
  const u = m[3];
  if (!(n > 0)) return null;
  if (/^(g|gr|grs|gramos)$/.test(u)) return { qty: n / 1000, unit: 'kg' };
  if (/^kg|^kilo/.test(u)) return { qty: n, unit: 'kg' };
  if (u === 'ml') return { qty: n / 1000, unit: 'l' };
  if (u === 'cl') return { qty: n / 100, unit: 'l' };
  if (/^(l|lt|litros?)$/.test(u)) return { qty: n, unit: 'l' };
  if (/^docena/.test(u)) n *= 12;
  return { qty: n, unit: 'ud' };
}

const cleanName = (name) => (name ?? '').replace(/&ordm;/g, 'º').replace(/&amp;/g, '&');

/** Fila de cualquier súper → producto común del comparador. */
function toProduct(store, r, cp, lang) {
  // Precio regional: Carrefour por comunidad, Consum por zona, Plusfresc por centro.
  let regional = null;
  if (store === 'carrefour') regional = r.regional_prices?.[REGION_CATALOG_NAME[regionFromPostalCode(cp)]];
  else if (store === 'consum') regional = r.regional_prices?.[consumZone(cp)];
  else if (store === 'plusfresc') regional = r.center_prices?.[plusfrescCenter(cp)];

  const price = Number(regional?.p ?? r.unit_price);
  const ppuRaw = regional?.ppu ?? r.price_per_unit;
  const unit = regional?.ppuu ?? r.price_per_unit_unit;
  // `price_format` a veces es solo el precio en texto ("1,77 €/u."): no es formato.
  // Gadis publica "U · 1" o "P · 0.19": indican venta por unidad o peso, no formato.
  const format = [r.packaging, regional?.pf, r.price_format].find((f) => f && !f.includes('€') && !/^[UP] · /.test(f)) ?? null;
  // Froiz guarda la cantidad en vez del precio por unidad: nunca es fiable.
  const trusted = store !== 'froiz' && ppuRaw != null && Number(ppuRaw) > 0 && ['kg', 'l', 'ud'].includes(unit);
  let ppu = trusted ? Number(ppuRaw) : null;
  let ppuUnit = ppu != null ? unit : null;
  // Sin precio por unidad, o con uno incoherente con el formato, se calcula de él.
  const q = price > 0 ? parseQuantity(`${format ?? ''} ${r.display_name ?? ''}`) : null;
  if (q) {
    const computed = Math.round((price / q.qty) * 100) / 100;
    const off = ppu == null || ppuUnit !== q.unit || Math.abs(ppu - computed) / computed > 0.4;
    if (off) { ppu = computed; ppuUnit = q.unit; }
  }
  return {
    uid: `${store}:${r.id}`,
    id: String(r.id),
    store,
    // `name` es el canónico en castellano (lo usa el emparejado de similares);
    // `label` es el que se muestra.
    name: cleanName(r.display_name),
    label: cleanName((lang === 'ca' && r.display_name_ca) || r.display_name),
    format,
    price,
    ppu,
    unit: ppuUnit,
    image: r.thumbnail ?? null,
  };
}

const valid = (p) => p.name && Number.isFinite(p.price) && p.price > 0;

/* ───────────────────────────── Búsqueda ───────────────────────────── */

/** Una página de búsqueda en un súper, ya normalizada. */
export async function searchStore(store, query, cp, { limit, signal, lang = 'es', queryLang = lang }) {
  const region = REGION_CATALOG_NAME[regionFromPostalCode(cp)] ?? null;
  const cols = columnsFor(store, lang);
  // Texto en catalán: las cadenas bilingües lo buscan en su catálogo catalán; el
  // resto, traducido, porque en castellano «llet» solo encuentra Llet Nostra.
  const inCatalan = queryLang === 'ca' && CATALAN_PRODUCTS.has(store);
  const term = queryLang === 'ca' && !inCatalan ? catalanToSpanish(query) : query;
  let rows;

  if (store === 'lidl') {
    const lidl = await resolveLidlStore(cp, signal);
    if (!lidl) return [];
    rows = await rest(`rpc/search_lidl_store_products?select=${cols}`, {
      body: { p_query: term, p_store_id: lidl.id, p_order: 'relevance', p_limit: limit, p_offset: 0 }, signal,
    });
  } else if (store === 'bm') {
    const location = await resolveBmLocation(cp, signal);
    if (!location) return [];
    rows = await rest(`rpc/search_bm_products?select=${cols}`, {
      body: { p_query: term, p_location_id: location, p_order: 'relevance', p_limit: limit, p_offset: 0 }, signal,
    });
  } else if (store === 'eljamon') {
    // El Jamón no tiene RPC de búsqueda (la app también consulta la tabla).
    const words = norm(term).split(/\s+/).filter((w) => w.length > 2 && !NOISE.has(w)).slice(0, 4);
    if (!words.length) return [];
    const filters = words.map((w) => `display_name_norm=ilike.*${encodeURIComponent(w)}*`).join('&');
    rows = await rest(`eljamon_products?select=${cols}&published=eq.true&${filters}&order=unit_price.asc&limit=${limit}`, { signal });
  } else {
    rows = await rest(`rpc/${RPC[store]}?select=${cols}`, {
      body: {
        p_query: term, p_lang: inCatalan ? 'ca' : 'es', p_region: region,
        p_center: store === 'plusfresc' ? plusfrescCenter(cp) : null,
        p_order: 'relevance', p_limit: limit, p_offset: 0,
      },
      signal,
    });
  }
  return (rows ?? []).map((r, i) => ({ ...toProduct(store, r, cp, lang), rank: i })).filter(valid);
}

/**
 * Busca `query` en todos los súper de la zona en paralelo. Llama a
 * `onStore(store, products | null, error)` según va llegando cada uno, para
 * pintar resultados progresivamente.
 */
export function searchAllStores({ query, cp, stores, limit = 10, signal, onStore, lang = 'es' }) {
  return Promise.allSettled(stores.map((store) =>
    searchStore(store, query, cp, { limit, signal, lang })
      .then((products) => { if (!signal?.aborted) onStore?.(store, products, null); return products; })
      .catch((error) => { if (!signal?.aborted && error.name !== 'AbortError') onStore?.(store, null, error); throw error; }),
  ));
}

/* ─────────────────────── Productos similares ─────────────────────── */

// Palabras que no describen el producto: formato, unidades, marcas propias y
// nombres de cadena. Se quitan para quedarse con "qué es" (leche entera…).
const NOISE = new Set(`
de del la las el los con y en a al para por e o u x
l lt litro litros ml cl g gr grs gramos kg kilo kilos ud uds unidad unidades
pack brik brick botella bote lata tarro bolsa caja paquete garrafa envase docena
bandeja malla pet vidrio cristal formato bipack indivisible tetra tetrabrik
hacendado deliplus carrefour auchan alcampo producto dia consum eroski
caprabo condis bonpreu esclat bonarea sorli ametller origen plusfresc gadis froiz
ahorramas hiperdino aldi lidl mercadona milbona bm mercado classic original marca
`.trim().split(/\s+/));

// Variantes que cambian el producto: deben coincidir en ambos sentidos
// (una leche "sin lactosa" no es equivalente a una normal).
const VARIANTS = [
  'lactosa', 'desnatada', 'desnatado', 'semidesnatada', 'semidesnatado', 'semi', 'zero', 'light', 'cero',
  'eco', 'ecologico', 'ecologica', 'bio', 'integral', 'cabra', 'oveja', 'codorniz', 'chocolate',
  'fresa', 'vainilla', 'limon', 'naranja', 'descafeinado', 'descafeinada', 'suave', 'intenso',
  'virgen', 'extra', 'girasol', 'cocidos', 'camperos', 'campera', 'ecologicos', 'azucar', 'griego',
  'congelado', 'congelada', 'congelados', 'polvo', 'condensada', 'evaporada', 'sabor', 'humedo',
  'capsulas', 'soluble', 'grano',
];

const tokens = (name) => norm(name).replace(/[^a-z0-9ñ]+/g, ' ').split(/\s+/).filter(Boolean);

/** Quita la marca inicial en MAYÚSCULAS ("AUCHAN Leche…", "LA CHISPA Refresco…"). */
function dropLeadingBrand(name) {
  // Nombre entero en mayúsculas (Condis): no hay marca que distinguir.
  if (name === name?.toUpperCase()) return name ?? '';
  const words = (name ?? '').split(/\s+/);
  let i = 0;
  while (i < words.length - 1 && words[i].length > 1 && words[i] === words[i].toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(words[i])) i++;
  return words.slice(i).join(' ');
}

/** Palabras clave de un producto: las 2 primeras que describen qué es. */
export function keyWords(name) {
  return tokens(dropLeadingBrand(name))
    .filter((t) => t.length > 1 && !NOISE.has(t) && !/^\d/.test(t))
    .slice(0, 2);
}

function variantsOf(name) {
  const t = new Set(tokens(name));
  return VARIANTS.filter((v) => t.has(v));
}

/** ¿`candidate` es el mismo tipo de producto que `source`? */
function isSimilar(source, candidate, keys, sourceVariants) {
  if (source.unit && candidate.unit && source.unit !== candidate.unit) return false;
  const t = new Set(tokens(candidate.name));
  if (!keys.every((k) => t.has(k) || [...t].some((w) => w.startsWith(k)))) return false;
  const cv = variantsOf(candidate.name);
  return cv.length === sourceVariants.length && cv.every((v) => sourceVariants.includes(v));
}

/**
 * Para cada súper de la zona, la opción más barata (por kg/l/ud) del mismo
 * tipo de producto. En el súper del producto elegido se mantiene el elegido.
 */
export async function findSimilar(product, { cp, stores, signal, lang = 'es' }) {
  const keys = keyWords(product.name);
  if (!keys.length) return { keys, rows: [product], failed: [] };
  const sourceVariants = variantsOf(product.name);
  const query = keys.join(' ');
  const others = stores.filter((s) => s !== product.store);

  const settled = await Promise.allSettled(others.map((s) => searchStore(s, query, cp, { limit: 24, signal, lang, queryLang: 'es' })));
  if (signal?.aborted) return null;

  const rows = [product];
  const failed = [];
  settled.forEach((r, i) => {
    if (r.status === 'rejected') { failed.push(others[i]); return; }
    const best = r.value
      .filter((c) => isSimilar(product, c, keys, sourceVariants))
      .sort((a, b) => (a.ppu ?? Infinity) - (b.ppu ?? Infinity) || a.price - b.price)[0];
    if (best) rows.push(best);
  });

  const cmp = (a, b) => (a.ppu != null && b.ppu != null ? a.ppu - b.ppu : a.price - b.price);
  return { keys, rows: rows.sort(cmp), failed };
}

/** Etiqueta de la tienda Lidl usada para el CP (para informar al usuario). */
export const lidlStoreFor = (cp) => resolveLidlStore(cp).catch(() => null);

/* ───────────────────────── Navegar por súper ───────────────────────── */

const TABLES = {
  mercadona: 'mercadona', carrefour: 'carrefour', dia: 'dia', aldi: 'aldi', alcampo: 'alcampo',
  consum: 'consum', eroski: 'eroski', esclat: 'bonpreu', bonarea: 'bonarea', sorli: 'sorli',
  caprabo: 'caprabo', condis: 'condis', ametller: 'ametller', plusfresc: 'plusfresc', gadis: 'gadis',
  froiz: 'froiz', ahorramas: 'ahorramas', eljamon: 'eljamon', hiperdino: 'hiperdino', bm: 'bm', lidl: 'lidl',
};

const ORDERS = {
  name: 'display_name_norm.asc,id.asc',
  price: 'unit_price.asc.nullslast,id.asc',
  ppu: 'price_per_unit.asc.nullslast,id.asc',
};

const treeCache = new Map();

/** "LECHE Y BEBIDAS" → "Leche y bebidas" (algunas cadenas gritan en mayúsculas). */
function niceName(name) {
  const n = (name ?? '').trim();
  return n === n.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(n) ? n.charAt(0) + n.slice(1).toLowerCase() : n;
}

/** Todas las filas de una consulta (PostgREST corta en 1.000). */
async function restAll(path, signal) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await rest(`${path}&limit=1000&offset=${offset}`, { signal });
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

/** Árbol categoría → subcategorías de un súper. Niveles más profundos no se
 *  navegan: `category_ids` incluye ancestros, así la subcategoría cubre su rama. */
export async function fetchCategoryTree(store, cp, signal, lang = 'es') {
  let path;
  let scope = `${store}:${lang}`;
  if (store === 'lidl') {
    const lidl = await resolveLidlStore(cp, signal);
    if (!lidl) return [];
    scope = `lidl:${lidl.id}:${lang}`;
    path = `lidl_store_category_catalog?select=id,name,parent_id,product_count&store_id=eq.${encodeURIComponent(lidl.id)}&published=eq.true&order=id`;
  } else if (store === 'mercadona') {
    path = 'mercadona_categories?select=id,name,parent_id,sort_order&published=eq.true&order=id';
  } else {
    const nameCols = lang === 'ca' && CATALAN_CATEGORIES.has(store) ? 'name,name_ca' : 'name';
    path = `${TABLES[store]}_categories?select=id,${nameCols},parent_id,product_count&published=eq.true&order=id`;
  }
  if (treeCache.has(scope)) return treeCache.get(scope);

  const rows = await restAll(path, signal);
  const hasCount = store !== 'mercadona';
  const byName = (a, b) => a.name.localeCompare(b.name, lang);
  const bySort = (a, b) => (a.sort ?? 0) - (b.sort ?? 0);
  const node = (r) => ({ id: String(r.id), name: niceName(r.name_ca || r.name), count: r.product_count ?? null, sort: r.sort_order, children: [] });
  const childrenOf = new Map();
  for (const r of rows) {
    if (r.parent_id == null) continue;
    if (hasCount && !(r.product_count > 0)) continue;
    const key = String(r.parent_id);
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key).push(node(r));
  }
  const order = store === 'mercadona' ? bySort : byName;
  const tree = rows
    .filter((r) => r.parent_id == null)
    .map((r) => {
      const root = node(r);
      root.children = (childrenOf.get(root.id) ?? []).sort(order);
      return root;
    })
    .filter((root) => root.children.length > 0 || root.count > 0)
    .sort(order);
  treeCache.set(scope, tree);
  return tree;
}

/** Ids a consultar para un nodo: sus subcategorías o, si no tiene, él mismo. */
export const categoryIds = (node) => (node.children.length ? node.children.map((c) => c.id) : [node.id]);

/** Una página de productos de un súper (entero o de unas categorías). */
export async function fetchStoreProducts({ store, cp, ids, order = 'name', offset = 0, limit = 48, signal, lang = 'es' }) {
  const filters = ['published=eq.true'];
  const catalanNames = lang === 'ca' && CATALAN_PRODUCTS.has(store);
  const sorting = order === 'name' && catalanNames ? 'display_name_ca_norm.asc.nullslast,id.asc' : ORDERS[order];
  let source = `${TABLES[store]}_products`;

  if (store === 'lidl') {
    const lidl = await resolveLidlStore(cp, signal);
    if (!lidl) return { products: [], total: 0 };
    source = 'lidl_product_stores';
    filters.push(`store_id=eq.${encodeURIComponent(lidl.id)}`);
  } else if (store === 'bm') {
    const location = await resolveBmLocation(cp, signal);
    if (!location) return { products: [], total: 0 };
    source = 'bm_product_locations';
    filters.push(`location_id=eq.${encodeURIComponent(location)}`, 'available=eq.true');
  } else if (['mercadona', 'carrefour', 'dia', 'consum'].includes(store)) {
    const region = REGION_CATALOG_NAME[regionFromPostalCode(cp)];
    if (region) filters.push(`or=${encodeURIComponent(`(regions.is.null,regions.eq.{},regions.cs.{${JSON.stringify(region)}})`)}`);
  } else if (store === 'plusfresc') {
    filters.push(`or=${encodeURIComponent(`(centers.is.null,centers.eq.{},centers.cs.{${JSON.stringify(plusfrescCenter(cp))}})`)}`);
  }

  if (ids?.length) {
    if (store === 'mercadona') filters.push(`category_id=in.(${ids.join(',')})`);
    else filters.push(`category_ids=ov.${encodeURIComponent(`{${ids.map((id) => JSON.stringify(id)).join(',')}}`)}`);
  }

  const res = await restResponse(
    `${source}?select=${columnsFor(store, lang)}&${filters.join('&')}&order=${sorting}&limit=${limit}&offset=${offset}`,
    { signal, headers: ids?.length ? { Prefer: 'count=exact' } : undefined },
  );
  const total = Number(res.headers.get('content-range')?.split('/')[1]);
  const rows = await res.json();
  return {
    products: rows.map((r, i) => ({ ...toProduct(store, r, cp, lang), rank: offset + i })).filter(valid),
    rowCount: rows.length,
    total: Number.isFinite(total) ? total : null,
  };
}
