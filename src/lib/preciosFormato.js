// Formatos compartidos por la home y las páginas /precios/.

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

export const euro = (n) => eur.format(n);
export const UNIT_NAME = { l: 'litro', kg: 'kilo', ud: 'unidad' };

const parse = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** "4 de noviembre de 2026" */
export const fechaLarga = (iso) => parse(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

/** "noviembre 2026" */
export const mesAnio = (iso) => parse(iso).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(' de ', ' ');
