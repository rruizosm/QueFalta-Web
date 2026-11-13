// Folleto vigente de Bonpreu i Esclat: su visor oficial vive siempre en la
// misma dirección y cambia de edición cada quince días. Al compilar se leen el
// título y las fechas de validez («Preus vàlids del 3 al 16 de novembre de
// 2026», en la primera página del texto del visor) para anunciarlo en
// /supermercados/bonpreu/ofertas/. No se copia nada del folleto: solo se enlaza.
// Si falla, la página sale igual con el enlace y sin fechas (no rompe la compilación).

const BASE = 'https://ofertes.bonpreuesclat.cat/.ofertes/';
export const FOLLETO_URL = `${BASE}#page=1`;

const MONTHS_CA = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];

const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** «Preus vàlids del 3 al 16 de novembre de 2026» → { from, to } (ISO) o null. */
export function parseValidity(text) {
  const m = text.match(/v[àa]lids?\s+del\s+(\d{1,2})(?:\s+(?:de\s+|d['’])(\p{L}+))?\s+al\s+(\d{1,2})\s+(?:de\s+|d['’])(\p{L}+)\s+de\s+(\d{4})/iu);
  if (!m) return null;
  const toMonth = MONTHS_CA.indexOf(m[4].toLowerCase()) + 1;
  const fromMonth = m[2] ? MONTHS_CA.indexOf(m[2].toLowerCase()) + 1 : toMonth;
  if (!toMonth || !fromMonth) return null;
  const year = Number(m[5]);
  // Un folleto de finales de diciembre puede acabar en enero.
  const fromYear = fromMonth > toMonth ? year - 1 : year;
  return { from: iso(fromYear, fromMonth, Number(m[1])), to: iso(year, toMonth, Number(m[3])) };
}

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'QueFalta-web-build' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function load() {
  try {
    const [html, xml] = await Promise.all([
      fetchText(BASE),
      fetchText(`${BASE}publication/contents/text_epub.xml`),
    ]);
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
    const firstPages = [...xml.matchAll(/<page[^>]*num="(\d+)"[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/page>/g)]
      .slice(0, 3).map((p) => p[2]).join(' ');
    const pages = (xml.match(/<page\b/g) ?? []).length || null;
    return { url: FOLLETO_URL, title, pages, validity: parseValidity(firstPages) };
  } catch (error) {
    console.warn(`[folleto] No se pudo leer el folleto de Bonpreu: ${error.message}`);
    return { url: FOLLETO_URL, title: null, pages: null, validity: null };
  }
}

let cached = null;

/** Folleto vigente (una lectura por compilación). */
export function loadFolleto() {
  cached ??= load();
  return cached;
}
