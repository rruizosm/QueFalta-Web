// Datos de las páginas por supermercado (/supermercados/*) — plan AEO F2.
// Reglas de redacción (ver AEO.md): respuesta directa primero, cifras
// concretas pero prudentes (los catálogos fluctúan cada semana → "más de",
// "en torno a"), y contenido ÚNICO por súper (si fueran clones, Google los
// trata como doorway pages).
// ⚠️ Regla de oro: solo afirmar lo que la app PUBLICADA tiene. Al desplegar
// un súper nuevo en la app: añadir su entrada aquí + tocar la FAQ y llms.txt.
// El texto de `faqs[].a` alimenta a la vez el HTML visible y el schema
// FAQPage (deben coincidir); admite el HTML que Google permite (a, ul, li…).

export const UPDATED = '2026-07-29';

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
  {
    slug: 'sorli',
    name: 'Sorli',
    logo: '/stores/sorli.png',
    title: 'Sorli en QuéFalta — más de 9.500 productos en castellano y catalán',
    description:
      'Haz la lista de la compra de Sorli con más de 9.500 productos de Sorliclic: precios, formatos, ofertas y nombres en castellano y catalán. Compartida en tiempo real y gratis.',
    summary:
      'Más de 9.500 productos de Sorliclic, en castellano y catalán, con precios y ofertas.',
    intro:
      'QuéFalta incluye más de 9.500 productos de Sorliclic, la tienda online de Sorli, con su precio, imagen y formato. El catálogo está disponible en castellano y catalán e incorpora las promociones que publica la cadena para que puedas preparar y compartir la cesta antes de comprar.',
    datos: [
      'Más de 9.500 productos del catálogo online de Sorli.',
      'Nombres y categorías en castellano y catalán, según el idioma de la app.',
      'Precio por formato, precio por unidad de medida y promociones vigentes cuando Sorli las publica.',
      'Precios y surtido sincronizados cada semana con Sorliclic.',
    ],
    faqs: [
      {
        q: '¿Puedo consultar el catálogo de Sorli en catalán?',
        a: 'Sí. QuéFalta muestra los nombres y las categorías de Sorli en castellano o catalán según el idioma configurado en la app. El catálogo incluye más de 9.500 productos de Sorliclic con su imagen, formato, precio y precio por unidad de medida.',
      },
      {
        q: '¿Qué ofertas de Sorli aparecen en QuéFalta?',
        a: 'QuéFalta incorpora las promociones que Sorli publica en su catálogo online, como descuentos directos, lotes, 3x2 o segunda unidad rebajada. La disponibilidad y las fechas pueden cambiar, así que el precio final es siempre el que indique Sorli en el momento de comprar.',
      },
    ],
  },
  {
    slug: 'eroski',
    name: 'Eroski',
    logo: '/stores/eroski.png',
    title: 'Eroski en QuéFalta — más de 22.000 productos con precio y ficha',
    description:
      'Haz la lista de la compra de Eroski con más de 22.000 productos: precios, ofertas y fichas con ingredientes, nutrición y conservación. Compartida en tiempo real y gratis.',
    summary:
      'Más de 22.000 productos, con ofertas y fichas de ingredientes, nutrición y conservación.',
    intro:
      'QuéFalta incluye más de 22.000 productos del supermercado online de Eroski con su precio, imagen, formato y marca. Puedes consultar las promociones y la ficha de muchos productos, y añadirlos a una lista compartida que todo el grupo actualiza en tiempo real.',
    datos: [
      'Más de 22.000 productos del supermercado online de Eroski.',
      'Ficha con ingredientes, información nutricional, conservación y fabricante cuando Eroski los publica.',
      'Promociones identificadas a partir de las ofertas visibles en su tienda online.',
      'Catálogo en castellano, sincronizado cada semana.',
    ],
    faqs: [
      {
        q: '¿Cuántos productos de Eroski hay en QuéFalta?',
        a: 'Más de 22.000 productos del supermercado online de Eroski, con imagen, formato, marca y precio. El catálogo se sincroniza cada semana y permite buscar por categorías antes de añadir cada producto a la lista de la compra compartida.',
      },
      {
        q: '¿Los productos de Eroski incluyen ingredientes y nutrición?',
        a: 'Muchos sí. Cuando Eroski publica la información, QuéFalta muestra ingredientes, valores nutricionales por 100 g o 100 ml, condiciones de conservación y fabricante. No todas las fichas de la cadena contienen los mismos campos, por lo que algunos productos muestran solo los datos disponibles.',
      },
    ],
  },
  {
    slug: 'caprabo',
    name: 'Caprabo',
    logo: '/stores/caprabo.png',
    title: 'Caprabo en QuéFalta — más de 12.000 productos con precio y ficha',
    description:
      'Haz la lista de la compra de Caprabo con más de 12.000 productos: precios, ofertas y fichas con ingredientes, nutrición y conservación. Compartida en tiempo real y gratis.',
    summary:
      'Más de 12.000 productos de Caprabo, con promociones y ficha detallada cuando está disponible.',
    intro:
      'QuéFalta reúne más de 12.000 productos de Capraboacasa con su precio, imagen, formato y marca. Busca por categorías, consulta las promociones y la información detallada que publica Caprabo, y prepara una cesta compartida en tiempo real con tu familia o tu grupo.',
    datos: [
      'Más de 12.000 productos de la tienda online Capraboacasa.',
      'Ficha con ingredientes, información nutricional, conservación y fabricante cuando están disponibles.',
      'Promociones visibles en el catálogo online de Caprabo.',
      'Catálogo en castellano, sincronizado cada semana.',
    ],
    faqs: [
      {
        q: '¿Puedo preparar la compra de Caprabo con QuéFalta?',
        a: 'Sí. Puedes buscar entre más de 12.000 productos de Caprabo, ver su precio, imagen, formato y marca, y añadirlos a una cesta compartida. Todos los miembros del grupo ven al instante qué falta y qué productos ya están en el carrito.',
      },
      {
        q: '¿Qué información muestran las fichas de Caprabo?',
        a: 'Cuando Caprabo la publica, la ficha incluye ingredientes, valores nutricionales, condiciones de conservación y fabricante. También verás la imagen, el formato, la marca y el precio del producto; las promociones se muestran cuando están identificadas en el catálogo online.',
      },
    ],
  },
  {
    slug: 'condis',
    name: 'Condis',
    logo: '/stores/condis.png',
    title: 'Condis en QuéFalta — más de 7.500 productos en castellano y catalán',
    description:
      'Haz la lista de la compra de Condis con más de 7.500 productos: precios, ofertas y fichas en castellano y catalán. Compartida en tiempo real y gratis.',
    summary:
      'Más de 7.500 productos, bilingües y con ficha de ingredientes y nutrición cuando se publica.',
    intro:
      'QuéFalta incluye más de 7.500 productos de la tienda online de Condis con precio, imagen, formato y marca. Los nombres y categorías están disponibles en castellano y catalán, y muchos artículos incorporan su ficha para consultar ingredientes y nutrición antes de añadirlos a la lista.',
    datos: [
      'Más de 7.500 productos del supermercado online de Condis.',
      'Nombres y categorías en castellano y catalán.',
      'Ficha con ingredientes, información nutricional, conservación y fabricante cuando Condis los publica.',
      'Precio de referencia de su tienda online y sincronización semanal.',
    ],
    faqs: [
      {
        q: '¿El catálogo de Condis está disponible en catalán?',
        a: 'Sí. QuéFalta muestra los nombres y las categorías de Condis en castellano o catalán según el idioma configurado en la app. El catálogo contiene más de 7.500 productos con su imagen, formato, marca y precio de referencia.',
      },
      {
        q: '¿Los precios de Condis son iguales en todas las tiendas?',
        a: 'QuéFalta usa como referencia el precio publicado por la tienda online de Condis para el área de Barcelona. El surtido disponible puede variar entre establecimientos y el precio final es siempre el indicado por la tienda donde hagas la compra.',
      },
    ],
  },
  {
    slug: 'ametller',
    name: 'Ametller Origen',
    logo: '/stores/ametller.png',
    title: 'Ametller Origen en QuéFalta — más de 3.000 productos bilingües',
    description:
      'Haz la lista de la compra de Ametller Origen con más de 3.000 productos en castellano y catalán, precios, ofertas e información nutricional. Gratis y compartida.',
    summary:
      'Más de 3.000 productos en castellano y catalán, con ofertas y ficha nutricional detallada.',
    intro:
      'QuéFalta incluye más de 3.000 productos de la tienda online de Ametller Origen, con nombres en castellano y catalán, precio, imagen, formato y marca. Muchos incorporan además ingredientes, información nutricional, conservación y origen para consultar la ficha antes de preparar la cesta.',
    datos: [
      'Más de 3.000 productos de la tienda online de Ametller Origen.',
      'Catálogo y fichas disponibles en castellano y catalán.',
      'Ingredientes, valores nutricionales, conservación y origen cuando la cadena los publica.',
      'Ofertas, precios y surtido sincronizados cada semana.',
    ],
    faqs: [
      {
        q: '¿Qué información de Ametller Origen muestra QuéFalta?',
        a: 'Más de 3.000 productos con su nombre, imagen, formato, marca y precio. Cuando Ametller Origen facilita el detalle, también puedes consultar ingredientes, valores nutricionales, conservación y origen antes de añadir el producto a tu lista de la compra.',
      },
      {
        q: '¿Ametller Origen aparece en castellano y catalán?',
        a: 'Sí. Tanto los nombres del catálogo como la información de las fichas se muestran en castellano o catalán según el idioma de QuéFalta. La disponibilidad de cada campo depende de lo que Ametller Origen publique para ese producto.',
      },
    ],
  },
  {
    slug: 'aldi',
    name: 'Aldi',
    logo: '/stores/aldi.png',
    title: 'Aldi en QuéFalta — más de 1.800 productos y ofertas con precio',
    description:
      'Haz la lista de la compra de Aldi con más de 1.800 productos de su catálogo online: precio, formato, precio por unidad y ofertas. Compartida en tiempo real y gratis.',
    summary:
      'Más de 1.800 productos del catálogo online, con precio por unidad y ofertas identificadas.',
    intro:
      'QuéFalta incluye más de 1.800 productos del catálogo online de Aldi con su precio, imagen, formato y precio por unidad de medida. También identifica las ofertas publicadas por la cadena para que puedas preparar una cesta compartida y estimar el total antes de comprar.',
    datos: [
      'Más de 1.800 productos del catálogo online de Aldi.',
      'Precio del envase y precio por kilo, litro o unidad cuando está disponible.',
      'Promociones y precio anterior cuando Aldi los publica.',
      'Precios nacionales de referencia para la Península y sincronización semanal.',
    ],
    faqs: [
      {
        q: '¿Puedo consultar los precios de Aldi en QuéFalta?',
        a: 'Sí. QuéFalta incluye más de 1.800 productos del catálogo online de Aldi con precio, imagen, formato y, cuando está disponible, precio por kilo, litro o unidad. También muestra las promociones que la cadena identifica en su catálogo.',
      },
      {
        q: '¿Los precios de Aldi son iguales en toda España?',
        a: 'QuéFalta muestra los precios nacionales de referencia publicados por Aldi para la Península. La propia cadena puede indicar condiciones diferentes para Canarias y el precio o la disponibilidad final pueden variar en cada tienda, por lo que deben tomarse como orientativos.',
      },
    ],
  },
  {
    slug: 'hiperdino',
    name: 'HiperDino',
    logo: '/stores/hiperdino.jpg',
    title: 'HiperDino en QuéFalta — más de 14.000 productos para Canarias',
    description:
      'Haz la lista de la compra de HiperDino con más de 14.000 productos de su supermercado online para Canarias: precios, formatos y ofertas. Compartida y gratis.',
    summary:
      'Más de 14.000 productos del supermercado online de referencia en Canarias, con precios y ofertas.',
    intro:
      'QuéFalta incluye más de 14.000 productos del supermercado online de HiperDino, cadena disponible en Canarias. Consulta su precio, imagen y formato, encuentra las ofertas publicadas y añade los productos a una lista que puedes compartir y actualizar en tiempo real.',
    datos: [
      'Más de 14.000 productos del supermercado online de HiperDino.',
      'Catálogo específico para Canarias, con precios que incluyen IGIC.',
      'Precio, imagen, formato y ofertas cuando existe un precio anterior publicado.',
      'Surtido y precios sincronizados cada semana.',
    ],
    faqs: [
      {
        q: '¿HiperDino está disponible fuera de Canarias?',
        a: 'HiperDino opera en Canarias y QuéFalta muestra su catálogo a los usuarios de esa comunidad autónoma. Incluye más de 14.000 productos de su supermercado online con imagen, formato y precio, además de las ofertas que publica la cadena.',
      },
      {
        q: '¿Los precios de HiperDino incluyen IGIC?',
        a: 'Sí. Los precios proceden del supermercado online de HiperDino para Canarias e incluyen el impuesto aplicado allí. Son orientativos y pueden cambiar según la tienda, la disponibilidad o la promoción vigente; el importe final es siempre el del punto de venta.',
      },
    ],
  },
  {
    slug: 'alcampo',
    name: 'Alcampo',
    logo: '/stores/alcampo.png',
    title: 'Alcampo en QuéFalta — más de 16.000 productos con precio y ficha',
    description:
      'Haz la lista de la compra de Alcampo con más de 16.000 productos: precios, ofertas y fichas con ingredientes, nutrición y origen. Compartida en tiempo real y gratis.',
    summary:
      'Más de 16.000 productos, con ofertas y fichas de ingredientes, nutrición, conservación y origen.',
    intro:
      'QuéFalta incluye más de 16.000 productos de la compra online de Alcampo con precio, imagen, formato y marca. Consulta sus ofertas y la ficha detallada que publica la cadena, y añade los productos a una cesta compartida para organizar la compra en tiempo real.',
    datos: [
      'Más de 16.000 productos del supermercado online de Alcampo.',
      'Ficha con ingredientes, información nutricional, conservación, preparación y origen cuando están disponibles.',
      'Precio por unidad de medida y promociones publicadas por la cadena.',
      'Catálogo y precios sincronizados cada semana.',
    ],
    faqs: [
      {
        q: '¿Cuántos productos de Alcampo hay en QuéFalta?',
        a: 'Más de 16.000 productos de su supermercado online con imagen, formato, marca y precio. Puedes buscar por categorías, consultar el precio por unidad de medida cuando está disponible y añadir cada artículo a la cesta compartida.',
      },
      {
        q: '¿Qué contiene la ficha de producto de Alcampo?',
        a: 'Cuando Alcampo publica la información, QuéFalta muestra ingredientes, valores nutricionales, conservación, preparación, denominación y origen. También incorpora las ofertas identificadas en la tienda online; algunos productos pueden tener una ficha más breve si la cadena no facilita todos los campos.',
      },
    ],
  },
  {
    slug: 'plusfresc',
    name: 'Plusfresc',
    logo: '/stores/plusfresc.png',
    title: 'Plusfresc en QuéFalta — cerca de 8.000 productos en castellano y catalán',
    description:
      'Haz la lista de la compra de Plusfresc con cerca de 8.000 productos en castellano y catalán, precios por zona, ofertas y ficha nutricional. Gratis y compartida.',
    summary:
      'Cerca de 8.000 productos bilingües, con surtido y precios adaptados al centro de compra.',
    intro:
      'QuéFalta incluye cerca de 8.000 productos de la tienda online de Plusfresc, con nombres en castellano y catalán, precio, imagen y formato. El catálogo adapta el surtido y los precios al centro asociado al código postal y ofrece fichas detalladas cuando la cadena las publica.',
    datos: [
      'Cerca de 8.000 productos de la tienda online de Plusfresc.',
      'Nombres y categorías en castellano y catalán.',
      'Surtido, precios y ofertas adaptados al centro de preparación asociado al código postal.',
      'Ficha con ingredientes, alérgenos, información nutricional y conservación cuando está disponible.',
    ],
    faqs: [
      {
        q: '¿Los precios de Plusfresc cambian según mi zona?',
        a: 'Sí. La tienda online de Plusfresc sirve el surtido y algunos precios según el centro de preparación asociado al código postal. QuéFalta usa esa ubicación para mostrar el catálogo disponible y el precio de referencia más adecuado para la zona.',
      },
      {
        q: '¿El catálogo de Plusfresc está en catalán?',
        a: 'Sí. Los nombres y las categorías están disponibles en castellano y catalán. Además, cuando Plusfresc publica la información, la ficha del producto incluye ingredientes, alérgenos, valores nutricionales y condiciones de conservación.',
      },
    ],
  },
];
