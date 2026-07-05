/**
 * Generador de las imágenes Open Graph del sitio (previews al compartir enlaces).
 *
 *   node scripts/og.mjs   →  public/og.png  +  public/og-join.png  (1200×630)
 *
 * Replica la identidad actual de la web: fondo claro con el halo azul del hero,
 * la cesta azul como logo y el wordmark Qué(ink)Falta(accent) en Space Grotesk.
 * Ojo: WhatsApp/Telegram cachean el preview por URL; los enlaces ya compartidos
 * pueden tardar en refrescarse, los nuevos salen bien desde el primer momento.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

// Playwright vive en el node_modules de la app móvil (carpeta hermana del repo).
const require = createRequire(new URL('../../MercaAppMobile/package.json', import.meta.url));
const { chromium } = require('playwright');

const HERE = dirname(fileURLToPath(import.meta.url));
const PUB = join(HERE, '..', 'public');

// Tokens de Layout.astro / landing.css — si cambia la marca, cambia esto.
const ACCENT = '#2f6cb5';
const INK = '#111114';
const INK_SOFT = '#5d5d66';
const ACCENT_LIGHT = 'rgba(47, 108, 181, 0.10)';

const logo = `data:image/png;base64,${readFileSync(join(PUB, 'quefalta-logo-blue.png')).toString('base64')}`;

const CARDS = [
  {
    file: 'og.png',
    eyebrow: null,
    subtitle: 'La lista de la compra compartida, en tiempo real',
  },
  {
    file: 'og-join.png',
    eyebrow: 'Invitación a un grupo',
    subtitle: 'Te han invitado a un grupo de la compra',
  },
];

function buildHtml({ eyebrow, subtitle }) {
  return /* html */ `<!doctype html><html lang="es"><head><meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; }
      .card {
        width: 1200px; height: 630px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 26px; text-align: center;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        background:
          radial-gradient(60% 55% at 50% -8%, ${ACCENT_LIGHT}, transparent 70%),
          radial-gradient(40% 40% at 88% 10%, rgba(63, 160, 120, 0.07), transparent 70%),
          #ffffff;
      }
      .eyebrow {
        font-size: 23px; font-weight: 700; letter-spacing: 3px;
        text-transform: uppercase; color: ${ACCENT};
      }
      .logo { width: 148px; height: 124px; object-fit: contain; }
      .word { font-size: 118px; font-weight: 700; letter-spacing: -0.035em; line-height: 1; color: ${INK}; }
      .word span { color: ${ACCENT}; }
      .sub { font-size: 40px; font-weight: 500; color: ${INK_SOFT}; letter-spacing: -0.01em; }
    </style></head>
    <body>
      <div class="card">
        ${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}
        <img class="logo" src="${logo}" alt="">
        <div class="word">Qué<span>Falta</span></div>
        <div class="sub">${subtitle}</div>
      </div>
    </body></html>`;
}

async function launchBrowser() {
  const attempts = [
    { channel: 'msedge' },
    { channel: 'chrome' },
    { executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
    {},
  ];
  let last;
  for (const opt of attempts) {
    try { return await chromium.launch({ headless: true, ...opt }); }
    catch (e) { last = e; }
  }
  throw last;
}

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const card of CARDS) {
  await page.setContent(buildHtml(card), { waitUntil: 'networkidle' });
  try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch {}
  await page.screenshot({ path: join(PUB, card.file) });
  console.log(`✓ public/${card.file}  (1200×630)`);
}
await browser.close();
