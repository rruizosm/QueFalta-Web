// Productos para el hogar: enlaces de afiliado de Amazon.es (tag quefalta-21).
// Reglas de Amazon Asociados: nada de precios copiados (sin PA-API) ni imágenes
// alojadas aquí; cada enlace lleva rel="sponsored nofollow noopener".
// ASIN elegidos el 2026-11-14 en Amazon.es: resultados orgánicos (no patrocinados)
// con buena nota y muchas reseñas. `img` (opcional) = URL de imagen que dé la API
// de Amazon (PA-API, disponible tras 3 ventas); sin ella se muestra el emoji.
// `cat` agrupa las tarjetas (ver CATEGORIAS). El orden importa: los 4 primeros
// salen en la portada.

export const AMAZON_TAG = 'quefalta-21';

export function amazonUrl(item) {
  return item.asin
    ? `https://www.amazon.es/dp/${item.asin}?tag=${AMAZON_TAG}`
    : `https://www.amazon.es/s?k=${encodeURIComponent(item.q)}&tag=${AMAZON_TAG}`;
}

export const CATEGORIAS = {
  conservar: { es: 'Conservar', ca: 'Conservar', tint: '#e8f1fb' },
  despensa: { es: 'Despensa', ca: 'Rebost', tint: '#fbf1e4' },
  cocinar: { es: 'Cocinar', ca: 'Cuinar', tint: '#fdeaea' },
  compra: { es: 'La compra', ca: 'La compra', tint: '#e9f6ee' },
  limpieza: { es: 'Limpieza', ca: 'Neteja', tint: '#f0ecfb' },
};

export const COCINA = [
  { cat: 'conservar', emoji: '🥡', asin: 'B07V6JDHZZ', es: ['Tuppers de cristal herméticos', 'KICHLY · 9 recipientes para sobras y fiambrera.'], ca: ['Tuppers de vidre hermètics', 'KICHLY · 9 recipients per a sobres i carmanyola.'] },
  { cat: 'cocinar', emoji: '⚖️', asin: 'B08NDVTN5C', es: ['Báscula de cocina digital', 'GRIFEMA · pesa raciones y compara el precio por kilo.'], ca: ['Bàscula de cuina digital', 'GRIFEMA · pesa racions i compara el preu per quilo.'] },
  { cat: 'despensa', emoji: '🫙', asin: 'B0F3CTF66V', es: ['Botes herméticos para despensa', 'GoMaihe · 24 tarros para pasta, arroz y legumbres.'], ca: ['Pots hermètics per al rebost', 'GoMaihe · 24 pots per a pasta, arròs i llegums.'] },
  { cat: 'compra', emoji: '🧺', asin: 'B007WP2G3A', es: ['Carro de la compra plegable', 'Rolser Plegamatic · para la compra grande.'], ca: ['Carro de la compra plegable', 'Rolser Plegamatic · per a la compra gran.'] },
  { cat: 'conservar', emoji: '📦', asin: 'B06ZYC1R6L', es: ['Contenedores herméticos', 'Amazon Basics · 3 de 1,2 l, nevera y congelador.'], ca: ['Recipients hermètics', 'Amazon Basics · 3 d\'1,2 l, nevera i congelador.'] },
  { cat: 'conservar', emoji: '🧊', asin: 'B09HV438VV', es: ['Organizadores de nevera', 'TATAY · ves lo que tienes y tiras menos.'], ca: ['Organitzadors de nevera', 'TATAY · veus què tens i llences menys.'] },
  { cat: 'conservar', emoji: '🔒', asin: 'B0D9XSJCSL', es: ['Envasadora al vacío', 'Bonsenkitchen · aprovecha las ofertas grandes.'], ca: ['Envasadora al buit', 'Bonsenkitchen · aprofita les ofertes grans.'] },
  { cat: 'conservar', emoji: '❄️', asin: 'B096NYFX71', es: ['Bolsas de silicona para congelar', 'IDEATECH · reutilizables, adiós al plástico.'], ca: ['Bosses de silicona per congelar', 'IDEATECH · reutilitzables, adeu al plàstic.'] },
  { cat: 'cocinar', emoji: '🍳', asin: 'B0BPYX2TGJ', es: ['Freidora de aire 8 l', 'Cecotec Cecofry · menos aceite y menos gasto.'], ca: ['Fregidora d\'aire 8 l', 'Cecotec Cecofry · menys oli i menys despesa.'] },
  { cat: 'cocinar', emoji: '🌡️', asin: 'B07WKKS4HB', es: ['Termómetro de cocina', 'DOQAUS · lectura en 3 segundos.'], ca: ['Termòmetre de cuina', 'DOQAUS · lectura en 3 segons.'] },
  { cat: 'cocinar', emoji: '🍲', asin: 'B0B74BH2YF', es: ['Termo para comida 800 ml', 'Dreamhigh · el tupper caliente hasta mediodía.'], ca: ['Termo per a menjar 800 ml', 'Dreamhigh · el tupper calent fins al migdia.'] },
  { cat: 'despensa', emoji: '🧂', asin: 'B0CT3MP6VZ', es: ['Especiero con 24 botes', 'edihome · especias ordenadas y a la vista.'], ca: ['Espaiera amb 24 pots', 'edihome · espècies endreçades i a la vista.'] },
  { cat: 'despensa', emoji: '🍴', asin: 'B0FBKT9DV9', es: ['Organizador de cubiertos', 'Lifewit · cajón ordenado de un vistazo.'], ca: ['Organitzador de coberts', 'Lifewit · calaix endreçat d\'un cop d\'ull.'] },
  { cat: 'despensa', emoji: '🍎', asin: 'B0FRS4H5CL', es: ['Frutero de 3 niveles', 'La fruta a la vista dura más.'], ca: ['Fruitera de 3 nivells', 'La fruita a la vista dura més.'] },
  { cat: 'compra', emoji: '🛍️', asin: 'B0D3LTJ18F', es: ['Bolsas de la compra plegables', 'Pack de 3 · siempre en el bolso.'], ca: ['Bosses de la compra plegables', 'Pack de 3 · sempre a la bossa.'] },
  { cat: 'limpieza', emoji: '🧽', asin: 'B079P6FST4', es: ['Paños de cocina de microfibra', 'Brabantia · secan sin dejar pelusa.'], ca: ['Draps de cuina de microfibra', 'Brabantia · eixuguen sense deixar pelussa.'] },
];

export const COCINA_TEXT = {
  es: {
    eyebrow: 'Productos para el hogar',
    title: 'Productos que ayudan a ahorrar en la compra',
    lead: 'Utensilios para conservar mejor, ordenar la despensa y tirar menos comida. Elegidos por su valoración en Amazon.',
    cta: 'Ver en Amazon',
    all: 'Ver todos los productos para el hogar',
    allShort: 'Todos',
    count: (n) => `${n} productos`,
    badge: 'Enlaces de afiliado',
    disclosure: 'Como Afiliado de Amazon, QuéFalta obtiene ingresos por las compras adscritas que cumplen los requisitos.',
    href: '/cocina/',
  },
  ca: {
    eyebrow: 'Productes per a la llar',
    title: 'Productes que ajuden a estalviar en la compra',
    lead: 'Estris per conservar millor, endreçar el rebost i llençar menys menjar. Triats per la seva valoració a Amazon.',
    cta: 'Veure a Amazon',
    all: 'Veure tots els productes per a la llar',
    allShort: 'Tots',
    count: (n) => `${n} productes`,
    badge: 'Enllaços d\'afiliat',
    disclosure: 'Com a Afiliat d\'Amazon, QuéFalta obté ingressos per les compres adscrites que compleixen els requisits.',
    href: '/ca/cuina/',
  },
};
