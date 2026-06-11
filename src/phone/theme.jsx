// theme.jsx — design tokens + live-tweak resolution + icon set for the phone mockups.
// Portado desde el prototipo (handoff). El landing fija el tema "Mercado Fresco".
import React from 'react';

// ── Font stacks ───────────────────────────────────────────────
const FONTS = {
  serif: "'Newsreader', Georgia, serif",
  display: "'Instrument Serif', Georgia, serif",
  sans: "'Archivo', system-ui, sans-serif",
  grotesk: "'Space Grotesk', system-ui, sans-serif",
  rounded: "'Mulish', system-ui, sans-serif",
  syne: "'Syne', system-ui, sans-serif",
  mono: "'Space Mono', ui-monospace, monospace",
};

const FONT_CHOICES = {
  Auto: null,
  'Serif editorial': { display: FONTS.serif, body: FONTS.serif },
  'Sans neutra': { display: FONTS.sans, body: FONTS.sans },
  'Geométrica': { display: FONTS.grotesk, body: FONTS.grotesk },
  'Redondeada': { display: FONTS.rounded, body: FONTS.rounded },
  'Monoespaciada': { display: FONTS.mono, body: FONTS.mono },
};

// ── helpers ───────────────────────────────────────────────────
export function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function lum(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
export function onAccent(hex) { return lum(hex) > 0.62 ? '#15140f' : '#ffffff'; }

// ── The 4 design languages (la landing usa "fresco") ──────────
export const THEMES = [
  {
    id: 'mono', name: 'Editorial Mono', blurb: 'Monocromo · serif · líneas finas',
    fontDisplay: FONTS.display, fontBody: FONTS.sans, dispWeight: 400, dispItalic: false,
    accent: '#15140f', accentSoft: '#f0eee8',
    bg: '#ffffff', surface: '#ffffff', surfaceAlt: '#f7f5f0',
    ink: '#15140f', inkSoft: '#6f6a60', inkFaint: '#b4afa3', border: '#e7e3da',
    ok: '#15140f',
    radius: 0, radiusLg: 0, borderWidth: 1, shadow: 'none',
    density: 'comfy', icon: 'line', upper: true, tracking: '0.14em', dispScale: 1.18,
  },
  {
    id: 'fresco', name: 'Mercado Fresco', blurb: 'Cálido · frutas · cards redondeadas',
    fontDisplay: FONTS.serif, fontBody: FONTS.rounded, dispWeight: 600, dispItalic: false,
    accent: '#df4b2e', accentSoft: '#fbe7df',
    bg: '#fbf6ee', surface: '#ffffff', surfaceAlt: '#f6efe3',
    ink: '#2b2521', inkSoft: '#8a7f73', inkFaint: '#c2b8a9', border: '#ece2d3',
    ok: '#3f8f4f',
    radius: 18, radiusLg: 26, borderWidth: 1.5, shadow: '0 8px 22px rgba(80,60,40,0.10)',
    density: 'regular', icon: 'line', upper: false, tracking: '0', dispScale: 1.06,
  },
  {
    id: 'neo', name: 'Soft Neo', blurb: 'Limpio · acento violeta · sin bordes, flotante',
    fontDisplay: FONTS.grotesk, fontBody: FONTS.rounded, dispWeight: 600, dispItalic: false,
    accent: '#5b53c6', accentSoft: '#ecebf8',
    bg: '#f3f2f8', surface: '#ffffff', surfaceAlt: '#fbfbfe',
    ink: '#1b1a22', inkSoft: '#777488', inkFaint: '#b9b6c6', border: '#e9e7f2',
    ok: '#3aa37a',
    radius: 22, radiusLg: 30, borderWidth: 0, shadow: '0 10px 30px rgba(40,33,90,0.12)',
    density: 'comfy', icon: 'line', upper: false, tracking: '0', dispScale: 1.0,
  },
  {
    id: 'bold', name: 'Bold Contrast', blurb: 'Alto contraste · display · borde grueso',
    fontDisplay: FONTS.syne, fontBody: FONTS.mono, dispWeight: 800, dispItalic: false,
    accent: '#d6fb3e', accentSoft: '#f0ffc4',
    bg: '#f4f2e9', surface: '#ffffff', surfaceAlt: '#ebe8dc',
    ink: '#141310', inkSoft: '#5d594f', inkFaint: '#9a958a', border: '#141310',
    ok: '#141310',
    radius: 4, radiusLg: 6, borderWidth: 2.5, shadow: '3px 3px 0 #141310',
    density: 'compact', icon: 'line', upper: true, tracking: '0.04em', dispScale: 1.04,
  },
];

// ── Tweak defaults (estado del prototipo en el export) ────────
export const TWEAK_DEFAULTS = {
  font: 'Geométrica',
  accent: 'Auto',
  bg: 'Auto',
  radius: 'Recto',
  border: 'Fino',
  icon: 'Línea',
  density: 'Compacto',
  shadow: 'Duro',
};

const RADIUS_MAP = { Recto: 0, Suave: 10, Redondo: 20, 'Píldora': 30 };
const BORDER_MAP = { Ninguno: 0, Fino: 1, Medio: 1.5, Grueso: 2.5 };
const DENSITY_MAP = { Compacto: 0.84, Normal: 1, Amplio: 1.16 };
const SHADOW_MAP = {
  Plano: 'none',
  Suave: '0 8px 22px rgba(40,33,30,0.10)',
  Elevado: '0 14px 34px rgba(40,33,30,0.16)',
  Duro: '3px 3px 0 currentColor',
};

// ── Resolve a base theme through the active tweaks ────────────
export function resolveTheme(base, tw) {
  const t = { ...base };
  const densKey = tw.density !== 'Auto' ? tw.density : ({ compact: 'Compacto', regular: 'Normal', comfy: 'Amplio' }[base.density]);
  const densScale = DENSITY_MAP[densKey] ?? 1;

  if (tw.font && tw.font !== 'Auto' && FONT_CHOICES[tw.font]) {
    t.fontDisplay = FONT_CHOICES[tw.font].display;
    t.fontBody = FONT_CHOICES[tw.font].body;
    t.dispItalic = false;
  }
  if (tw.accent && tw.accent !== 'Auto') {
    t.accent = tw.accent;
    t.accentSoft = hexA(tw.accent, 0.12);
  }
  if (tw.bg && tw.bg !== 'Auto') {
    t.bg = tw.bg;
    const dark = lum(tw.bg) < 0.4;
    t.surface = dark ? hexA('#ffffff', 0.06) : '#ffffff';
    t.surfaceAlt = dark ? hexA('#ffffff', 0.03) : t.surfaceAlt;
    if (dark) {
      t.ink = '#f4f2ee'; t.inkSoft = hexA('#f4f2ee', 0.62); t.inkFaint = hexA('#f4f2ee', 0.34);
      t.border = hexA('#ffffff', 0.14);
    }
  }
  if (tw.radius && tw.radius !== 'Auto') { t.radius = RADIUS_MAP[tw.radius]; t.radiusLg = RADIUS_MAP[tw.radius]; }
  if (tw.border && tw.border !== 'Auto') t.borderWidth = BORDER_MAP[tw.border];
  if (tw.icon && tw.icon !== 'Auto') t.icon = ({ 'Línea': 'line', Relleno: 'filled', 'Sin iconos': 'none' })[tw.icon];
  if (tw.shadow && tw.shadow !== 'Auto') t.shadow = SHADOW_MAP[tw.shadow] === '3px 3px 0 currentColor' ? '3px 3px 0 ' + t.ink : SHADOW_MAP[tw.shadow];

  t.densScale = densScale;
  t.onAccent = onAccent(t.accent);
  t.sp = (n) => Math.round(n * densScale);
  return t;
}

// Tema fijo del teléfono en el landing: Mercado Fresco + tweaks del export.
export const PHONE_THEME = resolveTheme(THEMES.find((t) => t.id === 'fresco'), TWEAK_DEFAULTS);

// Theme context — provides resolved tokens to every screen
export const ThemeCtx = React.createContext(null);
export function useTk() { return React.useContext(ThemeCtx); }

// ── Icon set (outline; 'filled' thickens + tints, 'none' hides) ─
const PATHS = {
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2 3h2.2l2.3 12.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L20 7H5.4"/>',
  user: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M2.5 19c0-3.2 2.7-4.9 6.5-4.9s6.5 1.7 6.5 4.9"/><path d="M16 5.2a3 3 0 0 1 0 5.6M21.5 19c0-2.4-1.3-3.9-3.4-4.6"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.8-3.8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M21 16l-5-5-7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 6.5"/>',
  camera: '<path d="M3 8.5a2 2 0 0 1 2-2h1.6L8 4.5h8l1.4 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.3"/>',
  trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8.5v5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.3 6.9"/>',
  share: '<circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.1 10.9l7.8-3.8M8.1 13.1l7.8 3.8"/>',
  expand: '<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
  home: '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  heart: '<path d="M12 20s-7-4.6-9.2-9C1.4 8.2 2.8 5 6 5c2 0 3 1.2 3.7 2.2C10.4 6.2 11.5 5 13.5 5c3.2 0 4.6 3.2 3.2 6-2.2 4.4-9.2 9-9.2 9z" transform="translate(0.3 0)"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  tag: '<path d="M3 12l8.5-8.5H20V12L11.5 20.5z"/><circle cx="15.5" cy="8.5" r="1.3"/>',
  bell: '<path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  leaf: '<path d="M5 19c0-9 7-14 14-14 0 9-5 14-14 14z"/><path d="M5 19c3-5 6-7 10-9"/>',
  trophy: '<path d="M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 15h6M8 20h8M12 15v3"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  arrowR: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  sliders: '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2.3"/><circle cx="9" cy="16" r="2.3"/>',
  edit: '<path d="M14.5 5.5l4 4M4 20l1-4L15.5 4.5l3.5 3.5L8 19.5z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.2-2.7 4M12 17.6h.01"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.3 6.3 0 0 0 20 14.5z"/>',
  shield: '<path d="M12 3l7 3v5c0 4.6-3 8.3-7 9.5C8 19.3 5 15.6 5 11V6z"/>',
  logout: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 16l4-4-4-4M20 12H9"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6h.01"/>',
  userPlus: '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.6 2.9-5.6 6.5-5.6 1 0 2 .2 2.9.5M17 11.5v6M14 14.5h6"/>',
  google: 'G',
};

export function Icon({ name, size = 20, color = 'currentColor', stroke, style = {} }) {
  const tk = useTk();
  const mode = tk ? tk.icon : 'line';
  if (mode === 'none') return null;
  if (name === 'google') {
    return <span style={{ fontWeight: 700, fontSize: size, color: '#4285F4', fontFamily: "'Archivo', sans-serif", ...style }}>G</span>;
  }
  const p = PATHS[name];
  if (!p) return null;
  const sw = stroke != null ? stroke : (mode === 'filled' ? 2.4 : 1.7);
  const fill = mode === 'filled' ? hexA(typeof color === 'string' && color.startsWith('#') ? color : '#000000', 0.16) : 'none';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={mode === 'filled' ? fill : 'none'}
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flex: '0 0 auto', ...style }}
      dangerouslySetInnerHTML={{ __html: p }} />
  );
}

export { FONT_CHOICES };
