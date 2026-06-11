// data.jsx — contenido de ejemplo para los mockups (extraído del prototipo).
export const USER = { name: 'Rubén', initials: 'RU' };

export const MEMBERS = {
  ru: { id: 'm1', name: 'Rubén', initials: 'RU', color: '#2f9e44' },
  ma: { id: 'm2', name: 'María', initials: 'MA', color: '#1971c2' },
  ca: { id: 'm3', name: 'Carlos', initials: 'CA', color: '#e8590c' },
  la: { id: 'm4', name: 'Laura', initials: 'LA', color: '#9c36b5' },
  le: { id: 'm5', name: 'Leo', initials: 'LE', color: '#f08c00' },
  an: { id: 'm6', name: 'Ana', initials: 'AN', color: '#e03131' },
  pe: { id: 'm7', name: 'Pedro', initials: 'PE', color: '#0c8599' },
  jo: { id: 'm10', name: 'Jorge', initials: 'JO', color: '#0c8599' },
};

export const GROUPS = [
  { id: 'g1', name: 'Casa', members: [MEMBERS.ru, MEMBERS.ma, MEMBERS.ca, MEMBERS.la], total: 20, done: 12, activity: 'hace 5 min', owner: true, active: true },
  { id: 'g2', name: 'Fiesta cumple Leo', members: [MEMBERS.ru, MEMBERS.le, MEMBERS.an, MEMBERS.pe], total: 15, done: 3, activity: 'hace 2 h', owner: true, active: false },
  { id: 'g3', name: 'Oficina', members: [MEMBERS.ru, MEMBERS.ma, MEMBERS.jo], total: 8, done: 8, activity: 'ayer', owner: false, active: false },
  { id: 'g4', name: 'Finde escapada', members: [MEMBERS.ru], total: 12, done: 0, activity: 'hace 3 días', owner: true, active: false },
];

export const CATEGORIES = [
  { id: 'c1', name: 'Fruta y verdura', sub: 8, emoji: '🥦', icon: 'leaf', color: '#3f8f4f' },
  { id: 'c2', name: 'Carne', sub: 6, emoji: '🥩', icon: 'tag', color: '#df4b2e' },
  { id: 'c3', name: 'Lácteos y huevos', sub: 5, emoji: '🥛', icon: 'tag', color: '#2f6cb5' },
  { id: 'c4', name: 'Panadería', sub: 4, emoji: '🍞', icon: 'tag', color: '#d98324' },
  { id: 'c5', name: 'Bebidas', sub: 7, emoji: '🧃', icon: 'tag', color: '#1f8a8f' },
  { id: 'c6', name: 'Conservas', sub: 9, emoji: '🥫', icon: 'tag', color: '#c98a1e' },
  { id: 'c7', name: 'Limpieza', sub: 8, emoji: '🧹', icon: 'tag', color: '#7a4fb5' },
  { id: 'c8', name: 'Congelados', sub: 5, emoji: '🧊', icon: 'tag', color: '#2f6cb5' },
];

export const LIST_ITEMS = [
  { id: 'i1', name: 'Leche entera', qty: 2, unit: 'l', inCart: true, emoji: '🥛', price: 1.05 },
  { id: 'i2', name: 'Plátanos', qty: 6, unit: 'ud', inCart: true, emoji: '🍌', price: 0.32 },
  { id: 'i3', name: 'Pan de molde', qty: 1, unit: 'ud', inCart: false, emoji: '🍞', price: 1.45 },
  { id: 'i4', name: 'Huevos camperos', qty: 12, unit: 'ud', inCart: false, emoji: '🥚', price: 0.28 },
  { id: 'i5', name: 'Almendras tostadas', qty: 1, unit: 'bolsa', inCart: true, emoji: '🥜', price: 2.75 },
  { id: 'i6', name: 'Yogur natural', qty: 4, unit: 'ud', inCart: false, emoji: '🥛', price: 0.45 },
  { id: 'i7', name: 'Tomates cherry', qty: 1, unit: 'bandeja', inCart: false, emoji: '🍅', price: 1.60 },
  { id: 'i8', name: 'Café molido', qty: 1, unit: 'paq', inCart: true, emoji: '☕', price: 3.20 },
];

export const PRODUCTS = [
  { id: 'p1', name: 'Almendras tostadas', unit: '200 g', price: 2.75 },
  { id: 'p2', name: 'Nueces peladas', unit: '200 g', price: 3.15 },
  { id: 'p3', name: 'Anacardos tostados', unit: '150 g', price: 2.95 },
  { id: 'p4', name: 'Pistachos sin cáscara', unit: '130 g', price: 3.45 },
  { id: 'p5', name: 'Mix de frutos secos', unit: '250 g', price: 3.20 },
];

export const euro = (n) => `${n.toFixed(2).replace('.', ',')} €`;
