// Prueba de título en /precios/<slug>/ (iniciada el 2026-11-19).
//
// Hipótesis: poner el precio más barato en el <title> sube el CTR en Google.
// Las páginas de PRUEBA usan «Precio de X: desde 0,79 €/l en Lidl»; el resto
// (control) mantiene «Precio de X en N supermercados (mes año)».
//
// Reparto: las 32 páginas ordenadas por impresiones de los 28 días previos
// (Search Console, 21-oct → 17-nov), emparejadas de dos en dos y sorteada una
// de cada par con semilla fija. Línea base de esos 28 días:
//   prueba  → 16 págs, 132 clics, 8.257 impr., CTR 1,60 %, pos. 7,11
//   control → 16 págs, 123 clics, 7.802 impr., CTR 1,58 %, pos. 7,74
//
// Cómo leerla: en Search Console › Rendimiento › Páginas, comparar el CTR de
// ambos grupos a partir de ~4 semanas tras el despliegue (Google tarda días en
// reescribir los títulos). Al decidir, aplicar el ganador a todas y borrar
// este fichero. No añadir slugs nuevos a mitad de prueba.

export const TITLE_TEST_SLUGS = new Set([
  'huevos', 'coca-cola', 'leche-sin-lactosa', 'leche-entera',
  'patatas', 'leche-semidesnatada', 'queso-rallado', 'pechuga-de-pollo',
  'cafe-molido', 'arroz-redondo', 'lentejas', 'pan-de-molde',
  'atun-en-aceite', 'garbanzos-cocidos', 'cacao-soluble', 'espaguetis',
]);
