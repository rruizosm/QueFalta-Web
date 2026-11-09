// Ficha de producto de la web (/producto/<súper>/<id>/): la misma información
// que la ficha de la app, leída de las tablas del catálogo con el rol anon.
// La usan la isla React (en el navegador, con el CP del visitante) y las
// páginas que se generan al compilar (con el CP de referencia de cada cadena).

import { REFERENCE_CP, STORE_BY_KEY } from '../data/comparadorZonas.js';
import { catalogFoodIndex } from './indiceAlimentario.js';
import {
  TABLES, columnsFor, resolveBmLocation, resolveLidlStore, rest, toProduct, valid,
} from './comparadorApi.js';

/* ───────────────────────────── Rutas ───────────────────────────── */

export const PRODUCT_BASE = { es: '/producto/', ca: '/ca/producte/' };

// bonÀrea usa «*» en sus ids («03*100908»): no vale en un nombre de carpeta.
const encodeId = (id) => String(id).replace(/\*/g, '~');
const decodeId = (id) => id.replace(/~/g, '*');

export const productPath = (store, id, lang = 'es') => `${PRODUCT_BASE[lang] ?? PRODUCT_BASE.es}${store}/${encodeId(id)}/`;

/** Segmentos de la ruta pública para getStaticPaths. */
export const productParams = (store, id) => ({ store, id: encodeId(id) });

/** /producto/<súper>/<id>/ → { store, id }, o null si no es una ficha. */
export function parseProductPath(pathname) {
  const m = pathname.match(/^\/(?:ca\/producte|producto)\/([a-z]+)\/([^/]+)\/?$/);
  if (!m || !STORE_BY_KEY[m[1]]) return null;
  return { store: m[1], id: decodeId(decodeURIComponent(m[2])) };
}

/* ───────────────────────── Columnas de ficha ───────────────────────── */

// Lo que publica cada cadena (ver MercaAppMobile/src/api/catalog.ts). Las
// columnas `_ca` se piden además en catalán, donde existen.
const DETAIL_COLS = {
  mercadona: 'ean,category_name,ingredients,nutrition,gluten_free_label',
  carrefour: 'ean,category_name,ingredients,allergens,nutrition,conservation,preparation,denomination,origin,operator,promo_name,promo_text,gluten_free_label',
  dia: 'brand,ean,category_name,description,ingredients,nutrition,conservation,preparation,denomination,operator,promo_name,promo_text,gluten_free_label',
  aldi: 'brand,ean,category_name,promo_name,gluten_free_label',
  alcampo: 'brand,ean,category_name,description,ingredients,nutrition,conservation,preparation,denomination,operator,origin,promo_name,promo_text,gluten_free_label',
  consum: 'brand,ean,category_name,gluten_free_label',
  eroski: 'brand,ean,category_name,ingredients,nutrition,conservation,manufacturer,promo_name,promo_text,gluten_free_label',
  esclat: 'brand,ean,category_name,product_info,supplier_name,ingredients,nutrition,promo_name,promo_text,gluten_free_label',
  bonarea: 'ean,category_name,description,ingredients,allergens,nutrition,conservation,denomination,origin,operator,gluten_free_label',
  sorli: 'brand,ean,category_name,nutri_score,promo_name,promo_text,gluten_free_label',
  caprabo: 'brand,ean,category_name,ingredients,nutrition,conservation,manufacturer,promo_name,promo_text,gluten_free_label',
  condis: 'brand,ean,category_name,ingredients,nutrition,conservation,manufacturer,promo_name,promo_text,gluten_free_label',
  ametller: 'brand,ean,category_name,ingredients,nutrition,conservation,origin,promo_name,promo_text,gluten_free_label',
  plusfresc: 'brand,category_name,description,ingredients,allergens,nutrition,conservation,promo_name,gluten_free_label',
  gadis: 'brand,category_name,promo_name,promo_text,gluten_free_label',
  froiz: 'brand,category_name,promo_name,promo_text,gluten_free_label',
  ahorramas: 'brand,category_name,promo_name,promo_text,gluten_free_label',
  hiperdino: 'brand,ean,category_name,gluten_free_label',
  eljamon: 'brand,ean,category_name,description,ingredients,allergens,nutrition,conservation,promo_name,promo_text,gluten_free_label',
  bm: 'brand,ean,category_name,ingredients,allergens,nutrition,conservation,promo_name,promo_text,gluten_free_label',
  lidl: 'brand,ean,category_name,promo_name,promo_text,gluten_free_label',
};

// Enlace a la ficha en la web de la cadena: columna que lo guarda y cómo se
// completa. Comprobado a mano (2026-11-09) que cada patrón abre el producto.
// Ahorramás y el resto no guardan la dirección del producto: sin enlace.
const STORE_URL_COL = {
  mercadona: 'raw->>share_url', carrefour: 'raw->>url', dia: 'raw->>url', condis: 'raw->>url',
  ametller: 'raw->>slugUrl', bonarea: 'raw->>urlFriendly', hiperdino: 'raw->>url_key',
  gadis: 'raw->>slug', froiz: 'raw->>slug', aldi: 'raw->>productSlug',
  bm: 'product_url', eljamon: 'product_url',
};

const STORE_URL = {
  mercadona: { host: 'tienda.mercadona.es' },
  bm: { host: 'www.online.bmsupermercados.es' },
  eljamon: { host: 'www.supermercadoseljamon.com' },
  ametller: { host: 'www.ametllerorigen.com' },
  bonarea: { host: 'www.bonarea-online.com' },
  carrefour: { host: 'www.carrefour.es', build: (v) => `https://www.carrefour.es${v}` },
  dia: { host: 'www.dia.es', build: (v) => `https://www.dia.es${v}` },
  condis: { host: 'compraonline.condis.es', build: (v) => `https://compraonline.condis.es${v}` },
  hiperdino: { host: 'www.hiperdino.es', build: (v) => `https://www.hiperdino.es/c9495/${v}.html` },
  gadis: { host: 'www.gadisline.com', build: (v) => `https://www.gadisline.com/${v.replace(/^\//, '')}` },
  froiz: { host: 'supermercado.froiz.com', build: (v) => `https://supermercado.froiz.com/producto/${v}` },
  aldi: { host: 'www.aldi.es', build: (v) => `https://www.aldi.es/producto/${v}.html` },
};

/** Enlace a la ficha del producto en la web de la cadena, o null. Solo se
 *  aceptan direcciones https del dominio de esa cadena (el dato viene de fuera). */
export function storeProductUrl(store, value) {
  const rule = STORE_URL[store];
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!rule || !raw) return null;
  try {
    const url = new URL(/^https?:\/\//.test(raw) ? raw : rule.build?.(raw) ?? '');
    return url.protocol === 'https:' && url.hostname === rule.host ? url.href : null;
  } catch {
    return null;
  }
}

const CATALAN_DETAIL = {
  bonarea: ['description', 'ingredients', 'allergens', 'nutrition', 'conservation', 'denomination', 'origin', 'operator'],
  ametller: ['ingredients', 'nutrition', 'conservation', 'origin'],
  plusfresc: ['description', 'ingredients', 'allergens', 'nutrition', 'conservation', 'promo_name'],
  esclat: ['promo_name'],
  sorli: ['promo_name', 'promo_text'],
};

/** Cadenas que publican un EAN consultable (para «mismo producto en…»). */
export const EAN_STORES = Object.keys(DETAIL_COLS).filter((s) => DETAIL_COLS[s].split(',').includes('ean'));

export function detailColumns(store, lang = 'es') {
  const cols = [columnsFor(store, lang), DETAIL_COLS[store]];
  if (STORE_URL_COL[store]) cols.push(`store_url:${STORE_URL_COL[store]}`);
  if (lang === 'ca' && CATALAN_DETAIL[store]) cols.push(CATALAN_DETAIL[store].map((c) => `${c}_ca`).join(','));
  return cols.join(',');
}

/* ───────────────────────── Texto de la ficha ───────────────────────── */

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&ordm;': 'º', '&ordf;': 'ª' };

/** Texto plano: sin etiquetas HTML ni espacios sobrantes. */
export function plainText(value) {
  if (value == null) return null;
  const text = String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? e)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
  return text || null;
}

/** Nutrición de Mercadona (jsonb) → líneas de texto como las demás cadenas. */
function mercadonaNutrition(value) {
  const blocks = Array.isArray(value) ? value : [];
  const lines = [];
  for (const b of blocks) {
    if (b?.per_quantity) lines.push(b.per_quantity);
    for (const n of b?.nutrients ?? []) {
      lines.push(`${n.name} ${n.amount} ${n.unit ?? ''}`.trim());
      for (const s of n.sub_nutrients?.items ?? []) lines.push(`  ${s.name} ${s.amount} ${s.unit ?? ''}`.trim());
    }
  }
  return lines.length ? lines.join('\n') : null;
}

/**
 * Tabla nutricional a partir del texto de la cadena: cada línea «Nombre valor»
 * se separa en dos columnas. Lo que no encaja queda como encabezado (rows: null
 * si casi nada encaja: entonces se muestra el texto tal cual).
 */
export function nutritionTable(text) {
  if (!text) return null;
  const lines = text.split('\n').map((l) => l.replace(/^[-•·*]\s*/, '').trim()).filter(Boolean);
  const head = [];
  const rows = [];
  for (const line of lines) {
    const m = line.match(/^(.*?[^\d\s:.,(])\s*:?\s+(<?\s*\d[\d.,]*\s*(?:k?j|k?cal|g|gr|mg|µg|mcg|ml|%|kj|kcal)?\b.*)$/i);
    if (!rows.length && /^(valor(es)? medios?|valor mitj|por |per |informaci)/i.test(line)) head.push(line);
    else if (m && m[1].length <= 60) rows.push({ name: m[1].replace(/:$/, ''), value: m[2].replace(/\bGR\b/g, 'g') });
    else if (!rows.length) head.push(line);
    else rows.push({ name: line, value: '' });
  }
  if (rows.filter((r) => r.value).length < 2) return null;
  return { head: head.join(' · ') || null, rows };
}

/** Fila de cualquier cadena → ficha común (sin depender de la cadena). */
export function toDetail(store, r, cp, lang = 'es') {
  const pick = (col) => {
    const ca = lang === 'ca' ? r[`${col}_ca`] : null;
    return plainText(ca || r[col]);
  };
  const nutrition = store === 'mercadona' ? mercadonaNutrition(r.nutrition) : pick('nutrition');
  const product = toProduct(store, r, cp, lang);
  return {
    ...product,
    brand: plainText(r.brand),
    category: plainText(r.category_name),
    ean: r.ean ? String(r.ean).trim() : null,
    storeUrl: storeProductUrl(store, r.store_url),
    // Índice alimentario estimado con la tabla de la ficha (en castellano, como
    // la app). En el navegador lo mejora Open Food Facts si conoce el EAN.
    nutritionIndex: catalogFoodIndex(store, r.nutrition, {
      productName: r.display_name, categoryName: r.category_name, ingredients: plainText(r.ingredients),
    }),
    glutenFree: r.gluten_free_label === true,
    promo: pick('promo_name'),
    promoText: pick('promo_text'),
    nutriScore: r.nutri_score ? String(r.nutri_score).trim().toUpperCase().slice(0, 1) : null,
    info: {
      description: pick('description') ?? pick('product_info'),
      denomination: pick('denomination'),
      ingredients: pick('ingredients'),
      allergens: pick('allergens'),
      nutrition,
      conservation: pick('conservation'),
      preparation: pick('preparation'),
      origin: pick('origin'),
      operator: pick('operator') ?? pick('manufacturer') ?? pick('supplier_name'),
    },
  };
}

/** ¿Cuánta ficha tiene? (para elegir qué página indexar). */
export const detailScore = (d) => Object.values(d.info).filter(Boolean).length + (d.ean ? 1 : 0) + (d.image ? 1 : 0);

/* ───────────────────────────── Lecturas ───────────────────────────── */

const inList = (values) => encodeURIComponent(`(${values.map((v) => JSON.stringify(String(v))).join(',')})`);

/** Origen de las filas de una cadena (Lidl y BM tienen precio por tienda). */
async function sourceFor(store, cp, signal) {
  if (store === 'lidl') {
    const lidl = cp ? await resolveLidlStore(cp, signal).catch(() => null) : null;
    return lidl ? { table: 'lidl_product_stores', filter: `store_id=eq.${encodeURIComponent(lidl.id)}`, fallback: 'lidl_products' } : { table: 'lidl_products' };
  }
  if (store === 'bm') {
    const location = cp ? await resolveBmLocation(cp, signal).catch(() => null) : null;
    return location ? { table: 'bm_product_locations', filter: `location_id=eq.${encodeURIComponent(location)}`, fallback: 'bm_products' } : { table: 'bm_products' };
  }
  return { table: `${TABLES[store]}_products` };
}

/**
 * Ficha de un producto. `cp` = CP del visitante (precio de su zona); sin él, el
 * de referencia de la cadena. Devuelve null si no existe o está retirado.
 */
export async function fetchProductDetail(store, id, { cp = null, lang = 'es', signal } = {}) {
  if (!STORE_BY_KEY[store]) return null;
  const zone = cp ?? REFERENCE_CP[store];
  const cols = detailColumns(store, lang);
  const src = await sourceFor(store, cp, signal);
  const query = (table, extra) => rest(`${table}?select=${cols}&id=eq.${encodeURIComponent(id)}&published=eq.true${extra ? `&${extra}` : ''}&limit=1`, { signal });
  let rows = await query(src.table, src.filter);
  // Fuera del surtido de la tienda del CP: ficha de la cadena (precio de referencia).
  if (!rows?.length && src.fallback) rows = await query(src.fallback);
  if (!rows?.length) return null;
  const detail = toDetail(store, rows[0], zone, lang);
  return valid(detail) ? detail : null;
}

/** Variantes del mismo EAN tal como lo guardan las cadenas (con o sin ceros). */
export function eanVariants(ean) {
  const digits = String(ean ?? '').replace(/\D/g, '');
  if (digits.length < 8) return [];
  const bare = digits.replace(/^0+/, '');
  return [...new Set([bare, bare.padStart(13, '0'), bare.padStart(14, '0'), digits])];
}

/**
 * El mismo producto (mismo EAN) en otras cadenas de `stores`, el más barato de
 * cada una. Llama a `onStore` según responde cada cadena.
 */
export async function findSameEan(product, { cp = null, stores, lang = 'es', signal }) {
  const variants = eanVariants(product.ean);
  if (!variants.length) return [];
  const others = stores.filter((s) => s !== product.store && EAN_STORES.includes(s));
  const settled = await Promise.allSettled(others.map(async (store) => {
    const src = await sourceFor(store, cp, signal);
    const filter = [`ean=in.${inList(variants)}`, 'published=eq.true', src.filter].filter(Boolean).join('&');
    const rows = await rest(`${src.table}?select=${columnsFor(store, lang)},ean&${filter}&limit=5`, { signal });
    return rows.map((r) => toProduct(store, r, cp ?? REFERENCE_CP[store], lang)).filter(valid)
      .sort((a, b) => a.price - b.price)[0] ?? null;
  }));
  return settled.filter((r) => r.status === 'fulfilled' && r.value).map((r) => r.value).sort((a, b) => a.price - b.price);
}
