// Bajadas de precio de la semana: productos cuyo precio ha bajado en los
// últimos 7 días según el historial que guardan los syncs (prev_unit_price,
// price_changed_at, price_delta_pct). Se usan en el banner verde de la vista de
// súper y en las páginas /supermercados/<slug>/bajadas/ (/ca/supermercats/<slug>/baixades/).
//
// PostgREST no compara dos columnas, así que «ha bajado» es price_delta_pct < 0.

/** Cadenas con historial de precios (BM no lo guarda). */
export const DROP_STORES = [
  'mercadona', 'carrefour', 'dia', 'aldi', 'alcampo', 'lidl', 'consum', 'eroski', 'esclat', 'bonarea',
  'sorli', 'caprabo', 'condis', 'ametller', 'plusfresc', 'gadis', 'froiz', 'ahorramas', 'eljamon', 'hiperdino',
];

const DROP_SET = new Set(DROP_STORES);
export const hasDrops = (store) => DROP_SET.has(store);

export const DROP_DAYS = 7;
export const DROP_COLS = 'prev_unit_price,price_delta_pct,price_changed_at';

/** Inicio de la ventana «esta semana» (hace 7 días, al empezar el día, UTC). */
export function dropsSince(now = new Date()) {
  const d = new Date(now.getTime() - DROP_DAYS * 86400000);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Filtros PostgREST de las bajadas desde `since`. */
export const dropFilters = (since) => [`price_changed_at=gte.${encodeURIComponent(since)}`, 'price_delta_pct=lt.0'];

/** Slug de la página de bajadas: el mismo que /supermercados/<slug>/. */
export const dropsSlug = (store) => (hasDrops(store) ? (store === 'esclat' ? 'bonpreu' : store) : null);

export const DROP_PAGES = DROP_STORES.map((store) => ({ store, slug: dropsSlug(store) }));

export const dropsPagePath = (store, lang = 'es') => {
  const slug = dropsSlug(store);
  if (!slug) return null;
  // Cuelga del catálogo de la cadena (src/lib/rutas.js).
  return lang === 'ca' ? `/ca/supermercats/${slug}/baixades/` : `/supermercados/${slug}/bajadas/`;
};

/** Fila con historial → bajada { price, was, pct, badge } o null. */
export function parseDrop(row) {
  const price = Number(row.unit_price);
  const was = Number(row.prev_unit_price);
  if (!(price > 0) || !(was > price)) return null;
  const pct = Math.max(1, Math.round((1 - price / was) * 100));
  return { kind: 'bajada', price, was, pct, badge: `−${pct} %` };
}
