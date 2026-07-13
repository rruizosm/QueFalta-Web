// Datos de las páginas por supermercado (/supermercados/*) — plan AEO F2.
// Reglas de redacción (ver AEO.md): respuesta directa primero, cifras
// concretas pero prudentes (los catálogos fluctúan cada semana → "más de",
// "en torno a"), y contenido ÚNICO por súper (si fueran clones, Google los
// trata como doorway pages).
// ⚠️ Regla de oro: solo afirmar lo que la app PUBLICADA tiene. Al desplegar
// un súper nuevo en la app: añadir su entrada aquí + tocar la FAQ y llms.txt.
// El texto de `faqs[].a` alimenta a la vez el HTML visible y el schema
// FAQPage (deben coincidir); admite el HTML que Google permite (a, ul, li…).

export const UPDATED = '2026-07-12';

export const STORES = [
  {
    slug: 'mercadona',
    name: 'Mercadona',
    logo: '/stores/mercadona.png',
    title: 'Mercadona en QuéFalta — la lista de la compra con sus precios reales',
    description:
      'Haz la lista de la compra de Mercadona con su catálogo completo: precios reales, ficha con ingredientes y alérgenos, y nombres también en catalán. Compartida en tiempo real y gratis.',
    summary:
      'El catálogo completo con precios reales, la ficha de producto más detallada y nombres también en catalán.',
    intro:
      'QuéFalta te permite hacer la lista de la compra de Mercadona con su catálogo completo: buscas cualquier producto, ves su precio y formato reales y lo añades con un toque a una cesta compartida que todo tu grupo ve en tiempo real. Gratis y sin anuncios.',
    datos: [
      'El catálogo completo de Mercadona, con el precio, la imagen y el formato de cada producto.',
      'Ficha de producto muy completa: ingredientes, alérgenos, valores nutricionales, origen o proveedor y conservación.',
      'Nombres de producto también en catalán, si usas la app en ese idioma.',
      'Los datos proceden de la API pública de Mercadona; parte de la información se consulta en vivo.',
    ],
    faqs: [
      {
        q: '¿Puedo consultar los precios de Mercadona sin usar su app?',
        a: 'Sí. QuéFalta muestra el catálogo de Mercadona con sus precios de forma gratuita: buscas cualquier producto, ves su precio y formato y lo añades a tu lista de la compra compartida. No necesitas cuenta de Mercadona ni pasar por su web.',
      },
      {
        q: '¿Qué información muestra la ficha de un producto de Mercadona?',
        a: 'Ingredientes, alérgenos, valores nutricionales, origen o proveedor y conservación, cuando Mercadona los publica. También la foto, el formato y el precio por unidad de medida, útil para comparar formatos antes de añadir el producto a la cesta.',
      },
    ],
  },
  {
    slug: 'carrefour',
    name: 'Carrefour',
    logo: '/stores/carrefour.png',
    title: 'Carrefour en QuéFalta — más de 15.000 productos con su precio',
    description:
      'Haz la lista de la compra de Carrefour con más de 15.000 productos de su supermercado online: precios actualizados cada semana y ficha con ingredientes y alérgenos. Compartida en tiempo real y gratis.',
    summary:
      'El catálogo más amplio de la app: más de 15.000 productos del supermercado online, con ficha detallada.',
    intro:
      'QuéFalta incluye más de 15.000 productos del supermercado online de Carrefour —el catálogo más amplio de la app— con su precio, imagen y formato. Añádelos a una lista compartida en tiempo real y estima el total de la cesta antes de ir a comprar.',
    datos: [
      'Más de 15.000 productos del supermercado online de Carrefour: el catálogo más amplio de QuéFalta.',
      'Ficha de producto detallada: ingredientes, alérgenos, valores nutricionales, conservación y denominación.',
      'Precios sincronizados cada semana con carrefour.es.',
    ],
    faqs: [
      {
        q: '¿Cuántos productos de Carrefour hay en QuéFalta?',
        a: 'Más de 15.000 productos del supermercado online de Carrefour, el catálogo más amplio de la app. Se sincroniza cada semana con carrefour.es, de modo que el surtido y los precios se mantienen al día sin que tengas que hacer nada.',
      },
      {
        q: '¿Los precios de Carrefour son los de mi tienda?',
        a: 'Son los del supermercado online de carrefour.es, así que pueden variar ligeramente respecto a tu hipermercado o súper más cercano. Úsalos como referencia para estimar el total de la cesta; el precio final es siempre el del punto de venta.',
      },
    ],
  },
  {
    slug: 'consum',
    name: 'Consum',
    logo: '/stores/consum.png',
    title: 'Consum en QuéFalta — la lista de la compra con sus precios',
    description:
      'Haz la lista de la compra de Consum con en torno a 9.000 productos de su tienda online: precio, imagen y formato, actualizados cada semana. Compartida en tiempo real y gratis.',
    summary:
      'En torno a 9.000 productos de la tienda online, con precio y formato siempre visibles.',
    intro:
      'QuéFalta incluye en torno a 9.000 productos de la tienda online de Consum con su precio, imagen y formato, para hacer la lista de la compra compartida con tu familia o tu piso y ver los cambios en tiempo real. Gratis y sin anuncios.',
    datos: [
      'En torno a 9.000 productos de la tienda online de Consum.',
      'Precio, imagen y formato siempre visibles; actualización semanal.',
      'Sin ficha de ingredientes: Consum no publica esa información en su tienda online.',
    ],
    faqs: [
      {
        q: '¿Puedo hacer la lista de la compra de Consum con QuéFalta?',
        a: 'Sí. QuéFalta incluye en torno a 9.000 productos de la tienda online de Consum con su precio, imagen y formato: los buscas, los añades a la cesta compartida y todo tu grupo ve los cambios en tiempo real. Gratis y sin anuncios.',
      },
      {
        q: '¿Los productos de Consum tienen ficha con ingredientes?',
        a: 'De momento no: Consum no publica los ingredientes ni la información nutricional en su tienda online, así que la ficha muestra el precio, el formato y la imagen. En los supermercados que sí los publican —Mercadona, Carrefour, Dia o bonÀrea— verás la ficha completa.',
      },
    ],
  },
  {
    slug: 'dia',
    name: 'Dia',
    logo: '/stores/dia.png',
    title: 'Dia en QuéFalta — la lista de la compra con sus precios',
    description:
      'Haz la lista de la compra de Dia con más de 5.000 productos de su catálogo online, marcas propias incluidas: precios semanales y ficha con ingredientes y nutrición. Compartida en tiempo real y gratis.',
    summary:
      'Más de 5.000 productos, marcas propias incluidas, con ficha de ingredientes y nutrición.',
    intro:
      'QuéFalta incluye más de 5.000 productos del catálogo online de Dia —marcas propias incluidas— con su precio, imagen y formato. Haz la lista de la compra compartida en tiempo real y consulta la ficha de muchos productos antes de añadirlos a la cesta.',
    datos: [
      'Más de 5.000 productos del catálogo online de Dia, marcas propias incluidas.',
      'Ficha con ingredientes, valores nutricionales, conservación y preparación cuando Dia los publica.',
      'Precios sincronizados cada semana con dia.es.',
    ],
    faqs: [
      {
        q: '¿Puedo ver los precios de Dia antes de ir a la tienda?',
        a: 'Sí. QuéFalta incluye más de 5.000 productos del catálogo online de Dia con su precio actualizado cada semana. Puedes estimar el total de tu cesta antes de salir de casa y compartir la lista con quien vaya a hacer la compra.',
      },
      {
        q: '¿QuéFalta incluye las marcas propias de Dia?',
        a: 'Sí: el catálogo incluye tanto las marcas propias de Dia como el resto de marcas de su tienda online. Muchos productos incorporan además su ficha con ingredientes, valores nutricionales, conservación y modo de preparación.',
      },
    ],
  },
  {
    slug: 'bonpreu',
    name: 'Bonpreu i Esclat',
    logo: '/stores/bonpreuesclat.png',
    title: 'Bonpreu i Esclat en QuéFalta — la llista de la compra, en catalán',
    description:
      'Haz la lista de la compra de Bonpreu i Esclat con el catálogo de su tienda online, en catalán y castellano: miles de productos con precio y formato. Compartida en tiempo real y gratis.',
    summary:
      'El catálogo de la tienda online del grupo Bon Preu, en catalán y castellano de forma nativa.',
    intro:
      'QuéFalta incluye el catálogo de la tienda online de Bonpreu i Esclat, en catalán y en castellano, con el precio y el formato de miles de productos. Ideal para compartir la lista de la compra en tiempo real si haces la compra en Catalunya.',
    datos: [
      'El catálogo de la tienda online del grupo Bon Preu (Bonpreu i Esclat).',
      'Bilingüe de forma nativa: los productos se muestran en catalán o en castellano según el idioma de la app.',
      'Miles de productos con precio y formato, actualizados cada semana.',
    ],
    faqs: [
      {
        q: '¿Puedo ver el catálogo de Bonpreu en catalán?',
        a: 'Sí. El catálogo de Bonpreu i Esclat se muestra en catalán o en castellano según el idioma que tengas configurado en la app; el catalán es el idioma nativo de su tienda online. La interfaz de QuéFalta también está disponible en ambos idiomas.',
      },
      {
        q: '¿Bonpreu y Esclat comparten catálogo en QuéFalta?',
        a: 'Sí. Las dos enseñas del grupo Bon Preu comparten tienda online, y QuéFalta las muestra como un único supermercado: miles de productos con su precio y su formato, actualizados cada semana.',
      },
    ],
  },
  {
    slug: 'bonarea',
    name: 'bonÀrea',
    logo: '/stores/bonarea.png',
    title: 'bonÀrea en QuéFalta — catálogo y ficha en castellano y catalán',
    description:
      'Haz la lista de la compra de bonÀrea con el catálogo de su tienda online: precio, imagen, formato y ficha bilingüe con ingredientes, alérgenos y nutrición. Compartida en tiempo real y gratis.',
    summary:
      'Catálogo y ficha de producto bilingües (castellano y catalán), con ingredientes y nutrición.',
    intro:
      'QuéFalta incluye el catálogo online de bonÀrea con el precio, la imagen y el formato de cada producto, y ficha bilingüe (castellano y catalán) con ingredientes, alérgenos y valores nutricionales. Comparte la lista con tu grupo y ved los cambios en tiempo real.',
    datos: [
      'El catálogo de la tienda online de bonÀrea, con precio, imagen y formato.',
      'Ficha de producto bilingüe (castellano y catalán): ingredientes, alérgenos, valores nutricionales, conservación y origen.',
      'Actualización semanal de precios y surtido.',
    ],
    faqs: [
      {
        q: '¿Qué información muestra la ficha de un producto de bonÀrea?',
        a: 'Ingredientes, alérgenos, valores nutricionales, conservación, denominación y origen, cuando bonÀrea los publica — en castellano y en catalán. Además del precio, la imagen y el formato de cada producto, actualizados cada semana.',
      },
      {
        q: '¿Puedo usar QuéFalta con bonÀrea en catalán?',
        a: 'Sí. Tanto la interfaz de la app como el catálogo y las fichas de producto de bonÀrea están disponibles en catalán y en castellano. QuéFalta muestra automáticamente el idioma que tengas configurado en la app.',
      },
    ],
  },
];
