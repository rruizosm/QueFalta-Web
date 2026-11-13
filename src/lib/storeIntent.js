// Búsquedas que en realidad piden un supermercado («bonpreu», «catálogo
// esclat», «ofertas mercadona»…): el comparador abre su catálogo en vez de
// buscar productos con ese nombre.

import { norm } from './comparadorApi.js';

// Nombres con los que la gente escribe cada cadena (ya normalizados: sin
// tildes, en minúsculas). Nada que sea también un producto («jamón»).
const ALIASES = {
  mercadona: ['mercadona'],
  lidl: ['lidl'],
  carrefour: ['carrefour', 'carrefour market', 'carrefour express'],
  dia: ['dia', 'supermercados dia'],
  aldi: ['aldi'],
  alcampo: ['alcampo'],
  consum: ['consum'],
  eroski: ['eroski'],
  bm: ['bm', 'bm supermercados'],
  esclat: ['bonpreu', 'bon preu', 'esclat', 'bonpreu esclat', 'bonpreu i esclat', 'bonpreu y esclat', 'bonpreuesclat'],
  bonarea: ['bonarea', 'bon area'],
  sorli: ['sorli', 'sorliclic'],
  caprabo: ['caprabo'],
  condis: ['condis'],
  ametller: ['ametller', 'ametller origen'],
  plusfresc: ['plusfresc', 'plus fresc'],
  gadis: ['gadis'],
  froiz: ['froiz'],
  ahorramas: ['ahorramas', 'ahorra mas'],
  eljamon: ['el jamon', 'eljamon', 'supermercados el jamon'],
  hiperdino: ['hiperdino', 'hiper dino'],
};

const BY_ALIAS = new Map(Object.entries(ALIASES).flatMap(([key, names]) => names.map((n) => [n, key])));

// Palabras que acompañan al nombre sin cambiar lo que se busca.
const OFFER_WORDS = new Set(['oferta', 'ofertas', 'oferte', 'ofertes', 'folleto', 'folletos', 'fulleto', 'promocion', 'promociones', 'promocio', 'promocions', 'descuento', 'descuentos', 'rebajas']);
const FILLER = new Set([
  'catalogo', 'cataleg', 'catalogos', 'productos', 'producto', 'productes', 'producte', 'precios', 'precio', 'preus', 'preu',
  'supermercado', 'supermercados', 'supermercat', 'supermercats', 'super', 'tienda', 'botiga', 'online', 'web',
  'de', 'del', 'el', 'la', 'los', 'las', 'en', 'a', 'al', 'i', 'y', 'les', 'els', 'esta', 'semana', 'aquesta', 'setmana', 'hoy', 'avui',
]);

/** «ofertas de bonpreu» → { store: 'esclat', offers: true }; null si no es una cadena. */
export function storeIntent(text) {
  const words = norm(text).replace(/[^a-z0-9ñç ]+/g, ' ').split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const offers = words.some((w) => OFFER_WORDS.has(w));
  const rest = words.filter((w) => !OFFER_WORDS.has(w) && !FILLER.has(w));
  // «el jamón» pierde su «el» como relleno: se prueba también con él.
  const store = BY_ALIAS.get(rest.join(' ')) ?? BY_ALIAS.get(words.filter((w) => !OFFER_WORDS.has(w)).join(' '));
  return store ? { store, offers } : null;
}
