// Zona del usuario → supermercados disponibles (comparador web).
// Copia de MercaAppMobile/src/constants/regions.ts: el código postal decide la
// provincia (2 primeros dígitos), la provincia decide la comunidad autónoma y
// la huella de cada cadena decide si opera allí. Si se toca la huella en la
// app, actualizarla también aquí.

export const STORES = [
  { key: 'mercadona', name: 'Mercadona', logo: '/stores/mercadona.png' },
  { key: 'lidl', name: 'Lidl', logo: '/stores/lidl.png' },
  { key: 'carrefour', name: 'Carrefour', logo: '/stores/carrefour.png' },
  { key: 'dia', name: 'Dia', logo: '/stores/dia.png' },
  { key: 'aldi', name: 'Aldi', logo: '/stores/aldi.png' },
  { key: 'alcampo', name: 'Alcampo', logo: '/stores/alcampo.png' },
  { key: 'consum', name: 'Consum', logo: '/stores/consum.png' },
  { key: 'eroski', name: 'Eroski', logo: '/stores/eroski.png' },
  { key: 'bm', name: 'BM', logo: '/stores/bm.png' },
  { key: 'esclat', name: 'Bonpreu i Esclat', logo: '/stores/bonpreuesclat.png' },
  { key: 'bonarea', name: 'bonÀrea', logo: '/stores/bonarea.png' },
  { key: 'sorli', name: 'Sorli', logo: '/stores/sorli.png' },
  { key: 'caprabo', name: 'Caprabo', logo: '/stores/caprabo.png' },
  { key: 'condis', name: 'Condis', logo: '/stores/condis.png' },
  { key: 'ametller', name: 'Ametller Origen', logo: '/stores/ametller.png' },
  { key: 'plusfresc', name: 'Plusfresc', logo: '/stores/plusfresc.png' },
  { key: 'gadis', name: 'Gadis', logo: '/stores/gadis.png' },
  { key: 'froiz', name: 'Froiz', logo: '/stores/froiz.jpg' },
  { key: 'ahorramas', name: 'Ahorramás', logo: '/stores/ahorramas.jpg' },
  { key: 'eljamon', name: 'El Jamón', logo: '/stores/eljamon.png' },
  { key: 'hiperdino', name: 'HiperDino', logo: '/stores/hiperdino.jpg' },
];

export const STORE_BY_KEY = Object.fromEntries(STORES.map((s) => [s.key, s]));

/** Huella de cada súper. null = nacional. */
const STORE_REGIONS = {
  mercadona: null,
  carrefour: null,
  dia: null,
  aldi: null,
  lidl: null,
  alcampo: null,
  bm: ['ES-PV', 'ES-CB', 'ES-NC', 'ES-RI', 'ES-MD'],
  eljamon: ['ES-AN'],
  esclat: ['ES-CT'],
  sorli: ['ES-CT'],
  caprabo: ['ES-CT'],
  ametller: ['ES-CT'],
  plusfresc: ['ES-CT', 'ES-AR'],
  gadis: ['ES-GA', 'ES-CL'],
  froiz: ['ES-GA', 'ES-CL', 'ES-CM', 'ES-MD'],
  ahorramas: ['ES-CM', 'ES-MD', 'ES-CL'],
  condis: ['ES-CT'],
  bonarea: ['ES-CT', 'ES-AR', 'ES-CM', 'ES-MD', 'ES-VC', 'ES-RI', 'ES-NC'],
  consum: ['ES-AN', 'ES-AR', 'ES-CM', 'ES-CT', 'ES-MC', 'ES-VC'],
  eroski: ['ES-AS', 'ES-AR', 'ES-CB', 'ES-CL', 'ES-CT', 'ES-GA', 'ES-IB', 'ES-NC', 'ES-PV', 'ES-RI'],
  hiperdino: ['ES-CN'],
};

// BM solo sincroniza un CP de referencia por provincia (retailerZones.ts).
const BM_PROVINCES = ['01', '20', '26', '28', '31', '39', '48'];

export const REGION_NAMES = {
  'ES-AN': 'Andalucía', 'ES-AR': 'Aragón', 'ES-AS': 'Asturias', 'ES-CN': 'Canarias',
  'ES-CB': 'Cantabria', 'ES-CM': 'Castilla-La Mancha', 'ES-CL': 'Castilla y León',
  'ES-CT': 'Cataluña', 'ES-CE': 'Ceuta', 'ES-MD': 'Comunidad de Madrid',
  'ES-VC': 'Comunidad Valenciana', 'ES-EX': 'Extremadura', 'ES-GA': 'Galicia',
  'ES-IB': 'Islas Baleares', 'ES-RI': 'La Rioja', 'ES-ML': 'Melilla',
  'ES-NC': 'Navarra', 'ES-PV': 'País Vasco', 'ES-MC': 'Región de Murcia',
};

const PROVINCE_REGION = {
  '01': 'ES-PV', '02': 'ES-CM', '03': 'ES-VC', '04': 'ES-AN', '05': 'ES-CL',
  '06': 'ES-EX', '07': 'ES-IB', '08': 'ES-CT', '09': 'ES-CL', '10': 'ES-EX',
  '11': 'ES-AN', '12': 'ES-VC', '13': 'ES-CM', '14': 'ES-AN', '15': 'ES-GA',
  '16': 'ES-CM', '17': 'ES-CT', '18': 'ES-AN', '19': 'ES-CM', '20': 'ES-PV',
  '21': 'ES-AN', '22': 'ES-AR', '23': 'ES-AN', '24': 'ES-CL', '25': 'ES-CT',
  '26': 'ES-RI', '27': 'ES-GA', '28': 'ES-MD', '29': 'ES-AN', '30': 'ES-MC',
  '31': 'ES-NC', '32': 'ES-GA', '33': 'ES-AS', '34': 'ES-CL', '35': 'ES-CN',
  '36': 'ES-GA', '37': 'ES-CL', '38': 'ES-CN', '39': 'ES-CB', '40': 'ES-CL',
  '41': 'ES-AN', '42': 'ES-CL', '43': 'ES-CT', '44': 'ES-AR', '45': 'ES-CM',
  '46': 'ES-VC', '47': 'ES-CL', '48': 'ES-PV', '49': 'ES-CL', '50': 'ES-AR',
  '51': 'ES-CE', '52': 'ES-ML',
};

/** Nombre de comunidad que esperan las RPC de búsqueda en `p_region`
 *  (REGION_MERCADONA_NAME de la app; es el que guardan las columnas regions). */
export const REGION_CATALOG_NAME = {
  'ES-CT': 'Catalunya', 'ES-VC': 'Comunitat Valenciana', 'ES-IB': 'Illes Balears',
  'ES-PV': 'Euskadi', 'ES-AN': 'Andalucía', 'ES-CM': 'Castilla-La Mancha',
  'ES-CL': 'Castilla y León', 'ES-AR': 'Aragón', 'ES-GA': 'Galicia',
  'ES-CN': 'Canarias', 'ES-MD': 'Comunidad de Madrid', 'ES-MC': 'Región de Murcia',
  'ES-NC': 'Navarra', 'ES-AS': 'Asturias', 'ES-CB': 'Cantabria',
  'ES-EX': 'Extremadura', 'ES-RI': 'La Rioja', 'ES-CE': 'Ceuta', 'ES-ML': 'Melilla',
};

// Zonas de Consum y centros de Plusfresc (retailerZones.ts de la app).
const CONSUM_ZONE_BY_PROVINCE = { '46': '147', '08': '575', '30': '495', '02': '1105', '04': '254' };
const PLUSFRESC_CENTER_BY_CP = {
  ...Object.fromEntries('25130 25135 25136 25139 25337 25600 25610 25612 25613 25614 25615 25616 25617 25670 25680 25690 25737'.split(' ').map((c) => [c, '61'])),
  ...Object.fromEntries('08006 08007 08008 08009 08010 08011 08012 08013 08014 08015 08016 08017 08018 08019 08021 08022 08023 08024 08025 08028 08029 08034 08036 08037'.split(' ').map((c) => [c, '3'])),
  ...Object.fromEntries('25001 25002 25003 25004 25005 25006 25007 25008 25100 25110 25111 25113 25123 25124 25171 25180 25190 25191 25192 25193 25194 25195 25196 25197 25198 25199 25660'.split(' ').map((c) => [c, '12'])),
  ...Object.fromEntries('08240 08241 08242 08243 08250 08251 08253 08254 08256 08259 08260 08262 08270 08271 08272 08275 08279 08289 08295 08296 08297 08650 08660 08670 08691'.split(' ').map((c) => [c, '58'])),
  ...Object.fromEntries('25141 25143 25220 25222 25230 25240 25241 25242 25243 25244 25245 25260 25261 25264 25265 25420'.split(' ').map((c) => [c, '17'])),
  ...Object.fromEntries('43001 43002 43003 43004 43005 43006 43007 43008 43110 43130 43151 43201 43202 43203 43204 43205 43206 43391 43481 43764 43840 43850'.split(' ').map((c) => [c, '33'])),
  ...Object.fromEntries('25200 25210 25211 25250 25262 25300 25318 25320 25330 25331 25332 25340 25341 25344 25350 25351 25353 25354 25360'.split(' ').map((c) => [c, '36'])),
  ...Object.fromEntries('08221 08222 08223 08224 08225 08226 08227 08228 08230'.split(' ').map((c) => [c, '110'])),
};
const BM_REFERENCE_CP = { '01': '01001', '20': '20009', '26': '26001', '28': '28008', '31': '31001', '39': '39001', '48': '48009' };

export const consumZone = (cp) => CONSUM_ZONE_BY_PROVINCE[cp.slice(0, 2)] ?? null;
// Sin centro propio se usa el de referencia (12, Lleida), igual que la app.
export const plusfrescCenter = (cp) => PLUSFRESC_CENTER_BY_CP[cp] ?? '12';
export const bmReferencePostalCode = (cp) => BM_REFERENCE_CP[cp.slice(0, 2)] ?? null;

/** CP español (5 dígitos) → código de comunidad, o null si no es válido. */
export function regionFromPostalCode(cp) {
  if (!/^\d{5}$/.test(cp)) return null;
  return PROVINCE_REGION[cp.slice(0, 2)] ?? null;
}

/** Supermercados disponibles para un CP válido, en orden canónico. */
export function storesForPostalCode(cp) {
  const region = regionFromPostalCode(cp);
  if (!region) return [];
  return STORES.filter((s) => {
    if (s.key === 'bm' && !BM_PROVINCES.includes(cp.slice(0, 2))) return false;
    const regions = STORE_REGIONS[s.key];
    return regions == null || regions.includes(region);
  });
}
