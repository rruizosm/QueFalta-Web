// finanzas.js — datos económicos de la página /apoyar.
//
// Las APORTACIONES (ingresos) NO se ponen aquí: se leen en tiempo de build
// directamente de Stripe (ver src/lib/aportaciones.js).
//
// Los GASTOS sí se mantienen a mano en este archivo. Para registrar un gasto
// real, añade un objeto al PRINCIPIO de la lista (lo más reciente arriba):
//   { fecha: 'YYYY-MM-DD', concepto: 'Texto del gasto', importe: 20 }
// `importe` en euros (número, sin símbolo). Tras editar, vuelve a desplegar
// la web para que se actualicen las cifras.

// Objetivo de financiación del año (coste aproximado de servidores).
export const GOAL = 240;

// Gastos reales, lo más reciente arriba. Para añadir uno nuevo, copia una línea.
export const GASTOS = [
  { fecha: '2026-06-21', concepto: 'Base de datos · Supabase', importe: 22.56 },
  { fecha: '2026-06-21', concepto: 'Expo Go Pro', importe: 17.22 },
  { fecha: '2026-06-21', concepto: 'Correo corporativo', importe: 8.57 },
  { fecha: '2026-06-11', concepto: 'Alta en Google Play', importe: 21.69 },
  { fecha: '2026-06-05', concepto: 'Cuenta de desarrollador de Apple (App Store)', importe: 99 },
  { fecha: '2026-06-05', concepto: 'Dominio quefalta.es', importe: 8.46 },
];
