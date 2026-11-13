// Ofertas de un súper: de las columnas promo_* de su tabla a lo que se pinta
// (precio que se paga, precio tachado y etiqueta). Se usa al compilar las
// páginas /ofertas/ y en el navegador (vista de súper del comparador).
//
// Fase 1: solo Bonpreu i Esclat (clave `esclat`, tabla `bonpreu_products`).
// Para añadir una cadena: su entrada en OFFER_STORES y, si su texto de promo
// tiene otro formato, ajustar `parseOffer` o escribir uno propio.

/** Cadenas con ofertas en la web → página /ofertas/<slug>/.
 *  `bannerProducts`: ids de productos básicos (no tienen por qué estar en
 *  oferta) cuyas fotos decoran el banner de la vista de súper. Si uno deja de
 *  estar publicado, simplemente no sale. */
export const OFFER_STORES = {
  esclat: {
    slug: 'bonpreu',
    table: 'bonpreu_products',
    categories: 'bonpreu_categories',
    bannerProducts: [
      '3fec24e5-8e6c-48ae-ab79-c04d51981dd9', // Aceite de oliva virgen extra (garrafa)
      'ca32dcf9-bc39-46bd-a90b-91c295e5fc57', // Leche entera 1 l
      '007f6357-f673-452e-b2cd-e18dabd7702e', // Pechuga de pollo
      'fdb1cbea-a8cd-46c4-bfdb-95eec80e693e', // Tomate en rama
      'fdba52b2-8800-4137-a180-aa8c9a6b07fb', // Barra de pan
    ],
  },
};

export const OFFER_COLS = 'promo_name,promo_name_ca,promo_text,promo_price,promo_base_price';

/** Filtro PostgREST: filas con alguna promoción. */
export const OFFER_FILTER = 'or=(promo_name.not.is.null,promo_text.not.is.null,promo_price.not.is.null)';

/* ─────────── Ofertas dentro del catálogo (vista de súper) ───────────
   Banner «Ofertas de la semana», filtro «Ver solo ofertas» y precio rebajado en
   las tarjetas. Más cadenas que las que tienen página /ofertas/: cada una
   guarda sus promos a su manera, así que aquí van sus columnas (con alias a
   los nombres comunes) y su filtro PostgREST. Fuera, a propósito: Dia (ofertas
   por región, mal casadas con el producto), Alcampo y Gadis (etiquetas de
   campaña sin precio). Mercadona y bonÀrea no publican ofertas.
   `zone`: cadenas cuyas ofertas valen solo en parte de sus zonas. */
const STD_COLS = 'promo_name,promo_text,promo_price,promo_base_price';
const STD_FILTER = 'or=(promo_name.not.is.null,promo_text.not.is.null,promo_price.not.is.null,promo_base_price.not.is.null)';
const STD = { cols: STD_COLS, filter: STD_FILTER };

export const CATALOG_OFFERS = {
  esclat: { cols: OFFER_COLS, filter: OFFER_FILTER },
  carrefour: {
    cols: 'promo_name,promo_text,promo_base_price:strikethrough_price',
    filter: 'or=(promo_name.not.is.null,strikethrough_price.not.is.null)',
  },
  eroski: STD, caprabo: STD, ahorramas: STD, froiz: STD, eljamon: STD, ametller: STD, bm: STD, lidl: STD,
  // Condis marca también las novedades en promo_name: no son ofertas.
  condis: {
    cols: STD_COLS,
    filter: `and=(or${STD_FILTER.slice(3)},or(promo_name.is.null,promo_name.neq.Novedad))`,
  },
  sorli: {
    cols: 'promo_name,promo_name_ca,promo_text,promo_base_price',
    filter: 'or=(promo_name.not.is.null,promo_base_price.not.is.null)',
  },
  aldi: { cols: 'promo_name,promo_base_price', filter: 'or=(promo_name.not.is.null,promo_base_price.not.is.null)' },
  hiperdino: { cols: 'promo_base_price', filter: 'promo_base_price=not.is.null' },
  consum: { cols: 'promo_base_price,offer_zones', filter: 'promo_base_price=not.is.null', zone: 'offer_zones' },
  plusfresc: {
    cols: 'promo_name,promo_name_ca,promo_price:promo_offer_price,promo_base_price,offer_centers',
    filter: 'or=(promo_name.not.is.null,promo_offer_price.not.is.null)',
    zone: 'offer_centers',
  },
};

/** Slug de la página de ofertas: el mismo que /supermercados/<slug>/. */
export const offersSlug = (store) => (CATALOG_OFFERS[store] ? OFFER_STORES[store]?.slug ?? store : null);

/** Cada cadena con ofertas tiene su página /supermercados/<slug>/ofertas/ (y /ca/supermercats/<slug>/ofertes/). */
export const OFFER_PAGES = Object.keys(CATALOG_OFFERS).map((store) => ({ store, slug: offersSlug(store) }));

export const offersPagePath = (store, lang = 'es') => {
  const slug = offersSlug(store);
  if (!slug) return null;
  // Cuelga del catálogo de la cadena (src/lib/rutas.js).
  return lang === 'ca' ? `/ca/supermercats/${slug}/ofertes/` : `/supermercados/${slug}/ofertas/`;
};

const num = (s) => Number(String(s).replace(/\./g, '').replace(',', '.'));
const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

// Tipos de promoción (el `promo_name` de Bonpreu) → clave estable.
const KIND_BY_NAME = {
  'Precio rebajado': 'rebaja',
  '2as unidades con descuento': 'segunda',
  'Unidades regalo': 'regalo',
  Bonificaciones: 'bonificacion',
  'Lotes oferta': 'lote',
  'Otras ofertas': 'otras',
};

export const KIND_LABEL = {
  es: {
    rebaja: 'Precio rebajado', segunda: '2ª unidad con descuento', regalo: '3x2, 2x1 y unidades de regalo',
    bonificacion: 'Bonificación con tarjeta', lote: 'Lotes de ahorro', otras: 'Otras ofertas',
  },
  ca: {
    rebaja: 'Preu rebaixat', segunda: '2a unitat amb descompte', regalo: '3x2, 2x1 i unitats de regal',
    bonificacion: 'Bonificació amb targeta', lote: 'Lots estalvi', otras: 'Altres ofertes',
  },
};

export const KIND_ORDER = ['rebaja', 'segunda', 'regalo', 'lote', 'bonificacion', 'otras'];

/* ─────────── Formato compacto (datos.json de /ofertas/<súper>/) ───────────
   La página carga todas las ofertas en el navegador para filtrar al instante.
   Claves cortas y la URL de la foto sin su prefijo/sufijo fijos: ~3 veces menos. */

const IMG_PREFIX = 'https://www.compraonline.bonpreuesclat.cat/images-v3/';
const IMG_SUFFIX = '/300x300.jpg';

const packImage = (url) => (url?.startsWith(IMG_PREFIX) && url.endsWith(IMG_SUFFIX)
  ? `~${url.slice(IMG_PREFIX.length, -IMG_SUFFIX.length)}` : url ?? null);
const unpackImage = (v) => (v?.startsWith('~') ? `${IMG_PREFIX}${v.slice(1)}${IMG_SUFFIX}` : v ?? null);

/** Oferta de ofertasSeo → fila compacta (ambos idiomas). */
export function packOffer(item) {
  const row = {
    i: item.id, n: item.name.es, f: item.format ?? undefined, m: packImage(item.image),
    p: item.offer.es.price, w: item.offer.es.was ?? undefined, d: item.offer.es.pct ?? undefined,
    b: item.offer.es.badge, k: item.offer.es.kind, g: item.category,
    q: item.ppu ?? undefined, u: item.unit ?? undefined,
  };
  if (item.name.ca !== item.name.es) row.nc = item.name.ca;
  if (item.offer.ca.badge !== item.offer.es.badge) row.bc = item.offer.ca.badge;
  return row;
}

/** Fila compacta → producto que pinta la tarjeta del comparador (ProductCard). */
export function unpackOffer(row, store, lang = 'es') {
  return {
    uid: `${store}:${row.i}`,
    id: String(row.i),
    store,
    name: row.n,
    label: (lang === 'ca' && row.nc) || row.n,
    format: row.f ?? null,
    price: row.p,
    ppu: row.q ?? null,
    unit: row.u ?? null,
    image: unpackImage(row.m),
    kind: row.k,
    category: row.g,
    pct: row.d ?? 0,
    offer: { badge: (lang === 'ca' && row.bc) || row.b, was: row.w ?? null, drop: row.k === 'bajada' },
  };
}

/** Orden por defecto: mayor descuento, luego tipo de oferta y nombre. */
export const byDiscount = (a, b) => (b.pct ?? 0) - (a.pct ?? 0)
  || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
  || a.name.localeCompare(b.name, 'es');

/** Texto de la promo (Bonpreu solo lo publica en castellano) → catalán. */
function textCa(text) {
  return text
    .replace(/(\d+)a unidad/g, '$1a unitat')
    .replace(/de descuento/g, 'de descompte')
    .replace(/Combínalos cómo quieras/g, "Combina'ls com vulguis")
    .replace(/de bonificación tarjeta cliente/g, 'de bonificació amb la targeta client')
    .replace(/Lote oferta a/g, 'Lot estalvi a')
    .replace(/euros\/lote/g, 'euros/lot')
    .replace(/unidades a/g, 'unitats a')
    .replace(/^Antes /, 'Abans ');
}

/** Etiqueta corta para la tarjeta («−30 % 2ª ud.», «3x2», «−10 %»). */
function badgeFor(text, lang) {
  let m = text.match(/(\d+)a unidad (\d+)% de descuento/);
  if (m) return lang === 'ca' ? `${m[1]}a unitat −${m[2]} %` : `${m[1]}ª ud. −${m[2]} %`;
  m = text.match(/\b(\d+x\d+)\b/);
  if (m) return m[1];
  m = text.match(/(\d+)% de bonificación/);
  if (m) return lang === 'ca' ? `−${m[1]} % targeta` : `−${m[1]} % tarjeta`;
  m = text.match(/^(\d+)% de descuento/);
  if (m) return `−${m[1]} %`;
  m = text.match(/(\d+) unidades a ([\d.,]+) EUR/);
  if (m) return lang === 'ca' ? `${m[1]} per ${euro.format(Number(m[2]))}` : `${m[1]} por ${euro.format(Number(m[2]))}`;
  m = text.match(/Lote oferta a ([\d.,]+) euros/);
  if (m) return lang === 'ca' ? `Lot a ${euro.format(num(m[1]))}` : `Lote a ${euro.format(num(m[1]))}`;
  return null;
}

/** Etiqueta corta a partir del nombre de la promo de otras cadenas
 *  («2ª unidad -70%», «3x2», «2x5€», «-14%», «5€ dto.»). */
function badgeFromName(name, kind, lang) {
  if (!name) return null;
  const n = name.trim();
  let m = n.match(/(\d+)\s*x\s*([\d.,]+)\s*€/i);
  if (m) return lang === 'ca' ? `${m[1]} per ${euro.format(num(m[2]))}` : `${m[1]} por ${euro.format(num(m[2]))}`;
  m = n.match(/\b(\d+)\s*x\s*(\d+)\b/i);
  if (m) return `${m[1]}x${m[2]}`;
  if (kind === 'segunda') {
    m = n.match(/(\d+)\s*%/);
    if (m) return lang === 'ca' ? `2a unitat −${m[1]} %` : `2ª ud. −${m[1]} %`;
  }
  m = n.match(/^-\s*(\d+)\s*%$/);
  if (m) return `−${m[1]} %`;
  return n.length <= 24 ? n.replace(/^!/, '¡') : null;
}

/** Tipo de promo por su nombre o texto, para las cadenas sin KIND_BY_NAME. */
function kindFromText(text) {
  const t = text.toLowerCase();
  if (/(^|[^\d])2\s*[ªa]\s*(u\b|ud\b|unidad|al\b)|segunda (unidad|al)/.test(t)) return 'segunda';
  if (/\b\d+\s*x\s*[\d.,]+\s*€|\blote|\bpack\b/.test(t)) return 'lote';
  if (/\b\d+\s*(x|por)\s*\d+\b(?!\s*[.,€])/.test(t)) return 'regalo';
  if (/tarjeta|\bclub\b|lidl plus|cup[oó]n/.test(t)) return 'bonificacion';
  if (/descuento|rebaj|bajada|reducido|^-\s*\d+\s*%|\boferta\b/.test(t)) return 'rebaja';
  return null;
}

/**
 * Fila con columnas promo_* → { kind, label, text, badge, price, was, pct } o
 * null si no tiene promoción. `price` es lo que se paga por una unidad; `was`,
 * el precio tachado cuando la cadena lo da. `current`: precio actual de la
 * fila (el regional, si la cadena lo tiene; si no, unit_price).
 */
export function parseOffer(row, lang = 'es', current = Number(row.unit_price)) {
  const raw = (row.promo_text ?? '').trim();
  if (!row.promo_name && !raw && row.promo_price == null && row.promo_base_price == null) return null;
  if (/^novedad$/i.test(row.promo_name ?? '') && !raw && row.promo_price == null && row.promo_base_price == null) return null;
  const unitPrice = current;
  let price = unitPrice;
  let was = null;
  let kind = KIND_BY_NAME[row.promo_name] ?? null;

  // «10% de descuento» con promo_price: se paga promo_price en vez de unit_price.
  if (row.promo_price != null && Number(row.promo_price) > 0 && Number(row.promo_price) < unitPrice) {
    price = Number(row.promo_price);
    was = unitPrice;
    kind ??= 'rebaja';
  }
  // «Antes 9,39€»: unit_price ya es el rebajado. «Antes 1,89€/kg» es por kilo:
  // no es comparable con el precio de la unidad, se deja solo como texto.
  const before = raw.match(/^Antes ([\d.,]+)\s?€$/);
  if (before) {
    const value = num(before[1]);
    if (value > price) was = value;
    kind ??= 'rebaja';
  }
  // Precio anterior publicado por la cadena (promo_base_price, o el tachado de
  // Carrefour): unit_price ya es el rebajado.
  const base = Number(row.promo_base_price);
  if (!was && base > price) was = base;
  // Nombre de la promo de otras cadenas («2ª unidad -70%», «3x2»…).
  kind ??= row.promo_name ? kindFromText(row.promo_name) : null;
  if (!kind && was) kind = 'rebaja';
  // Sin `promo_name`, el tipo se deduce del texto.
  if (!kind) {
    if (/^Antes |^\d+% de descuento/.test(raw)) kind = 'rebaja';
    else if (/\d+a unidad/.test(raw)) kind = 'segunda';
    else if (/\b\d+x\d+\b/.test(raw)) kind = 'regalo';
    else if (/^Lote oferta/.test(raw)) kind = 'lote';
    else if (/bonificación/.test(raw)) kind = 'bonificacion';
    else kind = kindFromText(raw) ?? 'otras';
  }

  const pct = was ? Math.round((1 - price / was) * 100) : null;
  // Solo la primera promo para la etiqueta; el texto completo va aparte.
  const first = raw.split(' · ')[0].replace(/\.?\s*Clica aquí\.?/g, '').trim();
  const text = raw.replace(/\.?\s*Clica aquí\.?/g, '').trim();
  const promoName = (lang === 'ca' && row.promo_name_ca) || row.promo_name;
  const badge = pct ? `−${pct} %`
    : (first ? badgeFor(first, lang) : null) ?? (KIND_BY_NAME[row.promo_name] ? null : badgeFromName(promoName, kind, lang));
  return {
    kind,
    label: KIND_LABEL[lang]?.[kind] ?? KIND_LABEL.es[kind],
    text: lang === 'ca' ? textCa(text) : text,
    badge: badge ?? KIND_LABEL[lang]?.[kind] ?? KIND_LABEL.es[kind],
    price,
    was,
    pct,
  };
}
