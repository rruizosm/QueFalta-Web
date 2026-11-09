// Índice alimentario (0-100) de la ficha de producto: el mismo cálculo que la
// app (MercaAppMobile/src/lib/foodIndex.ts, api/openFoodFacts.ts y
// api/mercadonaNutrition.ts). Si se cambia allí, cambiarlo aquí también.
//
// 1. Open Food Facts por EAN: nutrición (Nutri-Score), procesado (NOVA) y
//    sostenibilidad (Eco-Score), con pesos 60/25/15 según lo que haya.
// 2. Sin datos de OFF: estimación con la tabla nutricional de la ficha de la
//    cadena (algoritmo Nutri-Score 2023), solo con el bloque de nutrición.

const finite = (value) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const score100 = (value) => {
  const n = finite(value);
  return n == null ? null : clamp(n, 0, 100);
};
const isRecord = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

/* ───────────────────────────── Índice ───────────────────────────── */

function attributeScore(groups, id) {
  if (!Array.isArray(groups)) return null;
  for (const group of groups) {
    for (const a of (isRecord(group) && Array.isArray(group.attributes)) ? group.attributes : []) {
      if (isRecord(a) && a.id === id && a.status === 'known') return score100(a.match);
    }
  }
  return null;
}

const nutritionFallback = (grade) => (typeof grade === 'string' ? ({ A: 100, B: 75, C: 50, D: 25, E: 0 })[grade.trim().toUpperCase()] ?? null : null);
const processingFallback = (nova) => ({ 1: 100, 2: 75, 3: 50, 4: 0 })[finite(nova)] ?? null;
function sustainabilityFallback(score, grade) {
  if (typeof grade !== 'string' || !['a+', 'a', 'b', 'c', 'd', 'e', 'f'].includes(grade.trim().toLowerCase())) return null;
  return score100(score);
}

function parsePoints(data) {
  if (!isRecord(data) || !isRecord(data.components)) return [];
  return ['positive', 'negative'].flatMap((kind) => (Array.isArray(data.components[kind]) ? data.components[kind] : []).flatMap((item) => {
    if (!isRecord(item) || typeof item.id !== 'string') return [];
    const value = finite(item.value);
    const points = finite(item.points);
    const max = finite(item.points_max ?? item.pointsMax);
    if (value == null || points == null || max == null || max <= 0) return [];
    return [{ id: item.id, kind, points: clamp(points, 0, max), pointsMax: max, value, unit: typeof item.unit === 'string' ? item.unit : null }];
  }));
}

export function buildFoodIndex({ attributeGroups, nutritionScore, nutriScoreGrade, nutriScoreData, novaGroup, sustainabilityScore, sustainabilityGrade }) {
  const nutrition = score100(nutritionScore) ?? attributeScore(attributeGroups, 'nutriscore') ?? nutritionFallback(nutriScoreGrade);
  if (nutrition == null) return null;
  const processing = processingFallback(novaGroup) ?? attributeScore(attributeGroups, 'nova');
  const sustainability = attributeScore(attributeGroups, 'ecoscore') ?? sustainabilityFallback(sustainabilityScore, sustainabilityGrade);

  let weights;
  if (processing != null && sustainability != null) weights = { nutrition: 60, processing: 25, sustainability: 15 };
  else if (processing != null) weights = { nutrition: 70, processing: 30, sustainability: 0 };
  else if (sustainability != null) weights = { nutrition: 80, processing: 0, sustainability: 20 };
  else weights = { nutrition: 100, processing: 0, sustainability: 0 };

  const components = [{ id: 'nutrition', score: nutrition, weight: weights.nutrition }];
  if (processing != null && weights.processing) components.push({ id: 'processing', score: processing, weight: weights.processing });
  if (sustainability != null && weights.sustainability) components.push({ id: 'sustainability', score: sustainability, weight: weights.sustainability });

  const score = clamp(Math.round(
    nutrition * (weights.nutrition / 100) + (processing ?? 0) * (weights.processing / 100) + (sustainability ?? 0) * (weights.sustainability / 100),
  ), 0, 100);
  const points = parsePoints(nutriScoreData);
  return {
    score,
    components,
    positivePoints: points.filter((p) => p.kind === 'positive'),
    negativePoints: points.filter((p) => p.kind === 'negative'),
  };
}

/** Color semántico de rojo a verde para el índice 0-100. */
export function foodIndexColor(score) {
  if (score >= 80) return '#2f8f4e';
  if (score >= 60) return '#78a641';
  if (score >= 40) return '#d09a23';
  if (score >= 20) return '#d96b2b';
  return '#c83b32';
}
export const foodIndexTextColor = (score) => (score >= 40 && score < 60 ? '#2b2521' : '#ffffff');

const LIMITING = new Set(['energy', 'sugars', 'saturated_fat', 'salt', 'sweeteners']);
/** Calidad del nutriente 0-100: en lo que limita, menos puntos es mejor. */
export function foodPointScore(point) {
  if (point.pointsMax <= 0) return 50;
  const ratio = clamp(point.points / point.pointsMax, 0, 1);
  return Math.round((LIMITING.has(point.id) ? 1 - ratio : ratio) * 100);
}

export function foodIndexLevel(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  if (score >= 20) return 'low';
  return 'veryLow';
}

/* ─────────────── Estimación con la tabla de la ficha ─────────────── */

const key = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const foodText = (ctx) => key([ctx.productName, ctx.categoryName].filter(Boolean).join(' '));

function amountFor(table, ...names) {
  const wanted = names.map(key);
  for (const n of table.nutrients ?? []) {
    if (wanted.includes(key(n.name))) return finite(n.amount);
    for (const sub of n.sub_nutrients?.items ?? []) if (wanted.includes(key(sub.name))) return finite(sub.amount);
  }
  return null;
}

const amountFromText = (text, pattern) => {
  const m = text.match(pattern);
  return m ? finite(m[1].replace(',', '.')) : null;
};

const GENERAL_ENERGY = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
const GENERAL_SATURATES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const GENERAL_SUGARS = [3.4, 6.8, 10, 14, 17, 20, 24, 27, 31, 34, 37, 41, 44, 48, 51];
const SALT = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.2);
const FIBER = [3, 4.1, 5.2, 6.3, 7.4];
const PROTEINS = [2.4, 4.8, 7.2, 9.6, 12, 14, 17];
const BEVERAGE_ENERGY = [30, 90, 150, 210, 240, 270, 300, 330, 360, 390];
const BEVERAGE_SUGARS = [0.5, 2, 3.5, 5, 6, 7, 8, 9, 10, 11];
const BEVERAGE_PROTEINS = [1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3];
const FAT_SATURATED_ENERGY = [120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200];
const FAT_SATURATE_RATIO = [10, 16, 22, 28, 34, 40, 46, 52, 58, 64];
const above = (value, thresholds) => thresholds.filter((t) => value > t).length;

function foodKind(table, ctx) {
  const text = foodText(ctx);
  if (/\b100\s*ml\b/i.test(table.per_quantity ?? '') || /\b(agua|bebida|refresco|zumo|jugo|batido|leche|horchata|smoothie|nectar)\b/.test(text)) return 'beverage';
  if (/\b(aceite|mantequilla|margarina|manteca|frutos secos|almendra|avellana|nuez|pistacho|cacahuete|semilla)\b/.test(text)) return 'fatOilNuts';
  if (/\b(queso|mozzarella|parmesano|cheddar|gouda|manchego|brie|camembert)\b/.test(text)) return 'cheese';
  if (/\b(ternera|vacuno|buey|cerdo|cordero|hamburguesa|chorizo|salchicha|jamon)\b/.test(text)) return 'redMeat';
  return 'general';
}

function fvlPercent(kind, ctx) {
  const text = foodText(ctx);
  if (kind === 'fatOilNuts' && /\b(aceite de oliva|aceite.*aguacate|frutos secos|almendra|avellana|nuez|pistacho|cacahuete)\b/.test(text)) return 100;
  if (/\b(fruta|verdura|hortaliza|legumbre|tomate|zanahoria|espinaca|brocoli|manzana|platano|naranja)\b/.test(text)) return 100;
  return 0;
}

const sweetener = (ctx) => /\b(edulcorante|aspartamo|sucralosa|acesulfamo|sacarina|ciclamato|estevia)\b/.test(key(ctx.ingredients));

function gradeFor(kind, score, isWater) {
  if (kind === 'beverage') {
    if (isWater) return 'A';
    if (score <= 2) return 'B';
    if (score <= 6) return 'C';
    if (score <= 9) return 'D';
    return 'E';
  }
  if (kind === 'fatOilNuts') {
    if (score <= -6) return 'A';
    if (score <= 2) return 'B';
  } else {
    if (score <= 0) return 'A';
    if (score <= 2) return 'B';
  }
  if (score <= 10) return 'C';
  if (score <= 18) return 'D';
  return 'E';
}

/** Tabla estructurada (la de Mercadona) → índice estimado solo con nutrición. */
function fromTable(value, ctx, source) {
  const table = Array.isArray(value) ? value[0] : value;
  if (!isRecord(table) || !Array.isArray(table.nutrients)) return null;
  const energyKcal = finite(table.energy_calories?.amount);
  const energyKj = finite(table.energy_joules?.amount);
  const fat = amountFor(table, 'grasas', 'fat');
  const saturatedFat = amountFor(table, 'saturadas', 'grasas saturadas', 'saturated fat');
  const carbohydrates = amountFor(table, 'hidratos de carbono', 'carbohidratos', 'carbohydrates');
  const sugars = amountFor(table, 'azucares', 'sugars');
  const proteins = amountFor(table, 'proteinas', 'proteins');
  const salt = amountFor(table, 'sal', 'salt');
  const fiber = amountFor(table, 'fibra', 'fiber');
  if (![energyKcal, energyKj, fat, saturatedFat, carbohydrates, sugars, proteins, salt, fiber].some((v) => v != null)) return null;

  const kind = foodKind(table, ctx);
  const fvl = fvlPercent(kind, ctx);
  const isBeverage = kind === 'beverage';
  const isFat = kind === 'fatOilNuts';
  const negative = [];
  const positive = [];
  const neg = (id, value, unit, points, pointsMax) => negative.push({ id, kind: 'negative', value, unit, points, pointsMax });
  const pos = (id, value, unit, points, pointsMax) => positive.push({ id, kind: 'positive', value, unit, points, pointsMax });

  if (energyKj != null) {
    const v = isFat && saturatedFat != null ? saturatedFat * 37 : energyKj;
    neg('energy', v, isFat ? 'kJ de saturadas' : 'kJ', above(v, isFat ? FAT_SATURATED_ENERGY : isBeverage ? BEVERAGE_ENERGY : GENERAL_ENERGY), 10);
  }
  if (sugars != null) neg('sugars', sugars, 'g', above(sugars, isBeverage ? BEVERAGE_SUGARS : GENERAL_SUGARS), isBeverage ? 10 : 15);
  if (saturatedFat != null) {
    const v = isFat && fat != null && fat > 0 ? (saturatedFat / fat) * 100 : saturatedFat;
    neg('saturated_fat', v, isFat ? '% de grasas' : 'g', above(v, isFat ? FAT_SATURATE_RATIO : GENERAL_SATURATES), 10);
  }
  if (salt != null) neg('salt', salt, 'g', above(salt, SALT), 20);
  if (isBeverage && sweetener(ctx)) neg('sweeteners', 1, null, 4, 4);

  if (fiber != null) pos('fiber', fiber, 'g', above(fiber, FIBER), 5);
  if (fvl > 0) {
    const max = isBeverage ? 6 : 5;
    pos('fruits_vegetables_legumes', fvl, '%', fvl > 80 ? max : fvl > 60 ? 2 : fvl > 40 ? 1 : 0, max);
  }
  const negativeTotal = negative.reduce((s, p) => s + p.points, 0);
  const proteinMax = kind === 'redMeat' ? 2 : 7;
  const proteinPoints = proteins == null ? 0 : Math.min(proteinMax, above(proteins, isBeverage ? BEVERAGE_PROTEINS : PROTEINS));
  const proteinsCount = kind === 'cheese' || (isFat ? negativeTotal < 7 : negativeTotal < 11);
  if (proteins != null) pos('proteins', proteins, 'g', proteinsCount ? proteinPoints : 0, proteinMax);

  const counted = positive.filter((p) => p.id !== 'proteins' || proteinsCount).reduce((s, p) => s + p.points, 0);
  const raw = negativeTotal - counted;
  const isWater = isBeverage && /\bagua\b/.test(foodText(ctx)) && !sweetener(ctx) && energyKj === 0
    && (sugars ?? 0) === 0 && (saturatedFat ?? 0) === 0 && (salt ?? 0) === 0;
  const index = buildFoodIndex({ nutritionScore: clamp(Math.round(100 - ((raw + 10) * 2)), 0, 100) });
  return {
    source,
    nutriScoreGrade: gradeFor(kind, raw, isWater),
    novaGroup: null,
    additives: [],
    foodIndex: index && { ...index, positivePoints: positive, negativePoints: negative },
  };
}

/** Tabla en texto (Carrefour, Dia, Alcampo, bonÀrea…) → índice estimado. */
function fromText(value, ctx) {
  const text = typeof value === 'string' ? value : '';
  if (!text.trim()) return null;
  const g = String.raw`\s*[:\-]?\s*[<≤]?\s*(\d+(?:[.,]\d+)?)\s*g(?:r)?\b`;
  const energyKj = amountFromText(text, /(\d+(?:[.,]\d+)?)\s*k(?:j|joules?)\b/i);
  const energyKcal = amountFromText(text, /(\d+(?:[.,]\d+)?)\s*k(?:cal|calor[ií]as?)\b/i);
  const nutrients = [
    ['Grasas', amountFromText(text, new RegExp(String.raw`(?:\bgrasas?\b|\bgreixos?\b)${g}`, 'i'))],
    ['Grasas saturadas', amountFromText(text, new RegExp(String.raw`(?:(?:\bgrasas?\b|\bgreixos?\b)\s*)?(?:saturadas?|saturats?|saturados?)${g}`, 'i'))],
    ['Hidratos de carbono', amountFromText(text, new RegExp(String.raw`(?:hidratos? de carbono|carbohidratos?|carbohidrats?|hidrats? de carboni)${g}`, 'i'))],
    ['Azúcares', amountFromText(text, new RegExp(String.raw`(?:az[uú]cares?|sucres?)${g}`, 'i'))],
    ['Fibra', amountFromText(text, new RegExp(String.raw`(?:fibra)(?:\s+(?:alimentaria|alimentària))?${g}`, 'i'))],
    ['Proteínas', amountFromText(text, new RegExp(String.raw`(?:prote[ií]nas?|prote[iï](?:nes?|na))${g}`, 'i'))],
    ['Sal', amountFromText(text, new RegExp(String.raw`(?:sal)(?:\s+(?:equivalente|equivalent))?${g}`, 'i'))],
  ];
  return fromTable({
    per_quantity: /(?:por|per)\s*100\s*ml\b/i.test(text) ? '100 ml' : '100 g',
    energy_joules: energyKj == null ? null : { amount: energyKj },
    energy_calories: energyKcal == null ? null : { amount: energyKcal },
    nutrients: nutrients.flatMap(([name, amount]) => (amount == null ? [] : [{ name, amount, unit: 'g' }])),
  }, ctx, 'catalog');
}

/**
 * Índice estimado con lo que publica la cadena. `nutrition` es el jsonb de
 * Mercadona o el texto del resto; null si no da para calcularlo.
 */
export function catalogFoodIndex(store, nutrition, ctx = {}) {
  const info = store === 'mercadona' ? fromTable(nutrition, ctx, 'mercadona') : fromText(nutrition, ctx);
  return info?.foodIndex ? info : null;
}

/* ───────────────────────── Open Food Facts ───────────────────────── */

const OFF_FIELDS = [
  'nutriscore_grade', 'nutriscore_score', 'nutriscore_data', 'nova_group', 'additives_tags', 'ingredients',
  'ecoscore_score', 'ecoscore_grade', 'environmental_score_score', 'environmental_score_grade', 'attribute_groups_data',
].join(',');
const offCache = new Map();

const additiveCode = (v) => v.replace(/^[a-z]{2}:/i, '').trim().toUpperCase();

function additives(tags, ingredients) {
  if (!Array.isArray(tags)) return [];
  const names = new Map();
  const visit = (v) => {
    if (Array.isArray(v)) { v.forEach(visit); return; }
    if (!isRecord(v)) return;
    const code = typeof v.id === 'string' ? additiveCode(v.id) : '';
    const name = typeof v.text === 'string' ? v.text.trim() : '';
    if (/^E\d{3,4}[A-Z]?$/.test(code) && name && name.toUpperCase() !== code) names.set(code, name);
    visit(v.ingredients);
  };
  visit(ingredients);
  return [...new Set(tags.filter((t) => typeof t === 'string').map(additiveCode).filter(Boolean))]
    .map((code) => ({ code, name: names.get(code) ?? null }));
}

/**
 * Índice de Open Food Facts para un EAN, o null si OFF no lo conoce o no tiene
 * un Nutri-Score aplicable (entonces manda la estimación de la ficha).
 */
export function fetchOffFoodIndex(ean, { signal } = {}) {
  const code = String(ean ?? '').replace(/\D/g, '');
  if (!code) return Promise.resolve(null);
  if (!offCache.has(code)) {
    const request = fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${encodeURIComponent(OFF_FIELDS)}&cc=es`, {
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const p = json?.status === 1 ? json.product : null;
        const grade = typeof p?.nutriscore_grade === 'string' ? p.nutriscore_grade.toUpperCase() : null;
        if (!p || !/^[A-E]$/.test(grade ?? '')) return null;
        const nova = finite(p.nova_group ?? p.nova_groups);
        const novaGroup = nova != null && nova >= 1 && nova <= 4 ? nova : null;
        const foodIndex = buildFoodIndex({
          attributeGroups: p.attribute_groups_data,
          nutriScoreGrade: grade,
          nutriScoreData: p.nutriscore_data,
          novaGroup,
          sustainabilityScore: p.environmental_score_score ?? p.ecoscore_score,
          sustainabilityGrade: p.environmental_score_grade ?? p.ecoscore_grade,
        });
        return foodIndex ? { source: 'openfoodfacts', nutriScoreGrade: grade, novaGroup, additives: additives(p.additives_tags, p.ingredients), foodIndex } : null;
      });
    offCache.set(code, request);
    request.catch(() => offCache.delete(code));
  }
  const request = offCache.get(code);
  if (!signal) return request;
  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    request.then(resolve, reject);
  });
}
