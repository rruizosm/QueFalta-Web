// Dirección del catálogo de cada súper. Decisión del usuario (2026-11-13): una
// sola dirección indexable por cadena, /supermercados/<slug>/, que abre con el
// catálogo navegable; sus ofertas y bajadas cuelgan de ella
// (/supermercados/<slug>/ofertas/ y …/bajadas/). La portada ya no abre súper en
// /?super=…: esas direcciones antiguas saltan aquí (ver Comparador.jsx).
//
// En catalán, lo mismo bajo /ca/supermercats/<slug>/ (…/ofertes/, …/baixades/).

/** Clave del comparador → slug de /supermercados/ (Bonpreu i Esclat es «esclat»). */
export const catalogSlug = (store) => (store === 'esclat' ? 'bonpreu' : store);

/** Página del catálogo de un súper, con la categoría y el filtro de ofertas si los hay. */
export function catalogPath(store, lang = 'es', { cat = null, offers = false } = {}) {
  const q = new URLSearchParams();
  if (cat) q.set('cat', cat);
  if (offers) q.set('ofertas', '1');
  const search = q.toString();
  const base = lang === 'ca' ? `/ca/supermercats/${catalogSlug(store)}/` : `/supermercados/${catalogSlug(store)}/`;
  return `${base}${search ? `?${search}` : ''}`;
}

// Resultados de búsqueda (decisión del usuario, 2026-11-25): no se pintan en la
// portada sino en su propia página, /buscar/?q=… (en catalán /ca/cercar/?q=…).
// Va con noindex: Google pide no indexar resultados de búsquedas internas.

/** Página de resultados de búsqueda (sin `q`, la página vacía del buscador). */
export function searchPath(q = '', lang = 'es') {
  const base = lang === 'ca' ? '/ca/cercar/' : '/buscar/';
  const text = q.trim();
  return text ? `${base}?q=${encodeURIComponent(text)}` : base;
}
