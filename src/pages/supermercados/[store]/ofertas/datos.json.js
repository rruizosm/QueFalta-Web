// Todas las ofertas de un súper en formato compacto (ver packOffer en
// src/lib/ofertas.js). La carga la página /supermercados/<slug>/ofertas/ (y su versión en
// catalán) para filtrar por categoría y tipo de oferta sin pedir nada más.
import { OFFER_PAGES } from '../../../../lib/ofertas.js';
import { loadOfertas } from '../../../../lib/ofertasSeo.js';

export function getStaticPaths() {
  return OFFER_PAGES.map(({ store, slug }) => ({ params: { store: slug }, props: { store } }));
}

export async function GET({ props }) {
  const data = await loadOfertas(props.store);
  return new Response(JSON.stringify({ updated: data.updated, rows: data.rows }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
