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

// Gastos reales, lo más reciente arriba. Empieza vacío: rellena con tus gastos.
export const GASTOS = [
  // { fecha: '2026-06-18', concepto: 'Servidor y base de datos · junio', importe: 20 },
];
