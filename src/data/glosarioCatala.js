// Glosario catalán → castellano para la búsqueda del comparador en /ca/.
// Solo 7 cadenas publican catálogo en catalán; el resto lo tiene en castellano
// y «llet» solo encontraría la marca Llet Nostra. Las palabras que no están
// aquí se buscan tal cual.

const strip = (s) => s
  .toLowerCase()
  .normalize('NFD')
  .replace(/ñ/g, 'ñ')
  .replace(/[̀-ͯ]/g, '')
  .replace(/·/g, '');

// Frases cuya traducción no sale palabra a palabra. Se aplican primero.
const PHRASES = [
  ['pernil dolc', 'jamon cocido'],
  ['pit de pollastre', 'pechuga de pollo'],
  ['cafe molt', 'cafe molido'],
  ['oli d oliva', 'aceite de oliva'],
  ['oli de gira sol', 'aceite de girasol'],
  ['gira sol', 'girasol'],
];

const WORDS = {
  // Lácteos y huevos
  llet: 'leche', llets: 'leche', sencera: 'entera', sencer: 'entero', ou: 'huevo', ous: 'huevos',
  iogurt: 'yogur', iogurts: 'yogures', formatge: 'queso', formatges: 'quesos', ratllat: 'rallado',
  mantega: 'mantequilla', nata: 'nata',
  // Aceites, despensa y conservas
  oli: 'aceite', verge: 'virgen', arros: 'arroz', rodo: 'redondo', macarrons: 'macarrones',
  fideus: 'fideos', tomaquet: 'tomate', tomaquets: 'tomates', fregit: 'frito', tonyina: 'atun',
  pa: 'pan', motlle: 'molde', galeta: 'galleta', galetes: 'galletas', cereals: 'cereales',
  cafe: 'cafe', cacau: 'cacao', pols: 'polvo', sucre: 'azucar', farina: 'harina', sal: 'sal',
  mel: 'miel', xocolata: 'chocolate', melmelada: 'mermelada', cigrons: 'garbanzos', cuits: 'cocidos',
  cuit: 'cocido', llenties: 'lentejas', mongetes: 'judias', fruits: 'frutos', secs: 'secos',
  // Fruta y verdura
  fruita: 'fruta', verdura: 'verdura', platan: 'platano', platans: 'platanos', poma: 'manzana',
  pomes: 'manzanas', taronja: 'naranja', taronges: 'naranjas', llimona: 'limon', llimones: 'limones',
  maduixa: 'fresa', maduixes: 'fresas', raim: 'uva', patata: 'patata', patates: 'patatas',
  ceba: 'cebolla', cebes: 'cebollas', all: 'ajo', alls: 'ajos', pastanaga: 'zanahoria',
  pastanagues: 'zanahorias', enciam: 'lechuga', pebrot: 'pimiento', pebrots: 'pimientos',
  carbasso: 'calabacin', albergina: 'berenjena', cogombre: 'pepino', bledes: 'acelgas',
  // Carne y pescado
  pernil: 'jamon', pollastre: 'pollo', vedella: 'ternera', porc: 'cerdo', xai: 'cordero', gall: 'gallo',
  botifarra: 'butifarra', llom: 'lomo', salsitxa: 'salchicha', salsitxes: 'salchichas', peix: 'pescado',
  lluc: 'merluza', bacalla: 'bacalao', salmo: 'salmon', gambes: 'gambas', musclos: 'mejillones',
  // Bebidas
  aigua: 'agua', refresc: 'refresco', refrescos: 'refrescos', cervesa: 'cerveza', cerveses: 'cervezas',
  suc: 'zumo', sucs: 'zumos', vi: 'vino', vins: 'vinos', negre: 'tinto', blanc: 'blanco',
  // Limpieza e higiene
  paper: 'papel', higienic: 'higienico', cuina: 'cocina', detergent: 'detergente',
  suavitzant: 'suavizante', rentavaixelles: 'lavavajillas', rentaplats: 'lavavajillas', lleixiu: 'lejia',
  sabo: 'jabon', dutxa: 'ducha', xampu: 'champu', dents: 'dientes', dentifrici: 'dentifrico',
  desodorant: 'desodorante', bolquers: 'panales', tovalloletes: 'toallitas', compreses: 'compresas',
  // Partículas
  amb: 'con', sense: 'sin', d: 'de', i: 'y', congelat: 'congelado', congelats: 'congelados',
  ecologic: 'ecologico', ecologica: 'ecologica', integrals: 'integrales',
};

/** «Oli d'oliva verge» → «aceite de oliva virgen». */
export function catalanToSpanish(text) {
  let q = ` ${strip(text).replace(/[^a-z0-9ñ]+/g, ' ').trim()} `;
  for (const [ca, es] of PHRASES) q = q.replaceAll(` ${ca} `, ` ${es} `);
  // Lo que ya ha traducido una frase no se vuelve a traducir: solo cambian
  // palabras que siguen en catalán (ninguna traducción es clave del glosario,
  // salvo las que se traducen a sí mismas).
  return q.trim().split(/\s+/).map((w) => WORDS[w] ?? w).join(' ');
}
