// Todos los productos que han bajado de precio esta semana en un súper, en el
// formato compacto de las ofertas (packOffer). Lo carga /supermercados/<slug>/bajadas/.
import { DROP_PAGES } from '../../../../lib/bajadas.js';
import { loadBajadas } from '../../../../lib/ofertasSeo.js';

export function getStaticPaths() {
  return DROP_PAGES.map(({ store, slug }) => ({ params: { store: slug }, props: { store } }));
}

export async function GET({ props }) {
  const data = await loadBajadas(props.store);
  return new Response(JSON.stringify({ updated: data.updated, rows: data.rows }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
