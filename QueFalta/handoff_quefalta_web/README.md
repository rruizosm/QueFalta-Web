# Handoff: Web de marketing "QueFalta" (landing iOS)

## Overview
Landing page de una sola pieza para presentar la app **QueFalta** (lista de la compra compartida para iOS). Estructura: **hero** con nombre + descripción + descarga en App Store, una sección de **scrollytelling** donde un render de iPhone queda fijo a la derecha y va cambiando de pantalla pestaña a pestaña mientras a la izquierda se leen las capacidades de cada función, y un **cierre** oscuro con la llamada a la descarga.

**Importante — esto NO es la app.** Es un sitio web independiente. No va dentro del repo React Native `MercaAppMobile`. Debe vivir en su propio proyecto web. Comparte el **sistema visual** ("Mercado Fresco / QueFalta") con la app para que se sientan la misma marca, pero la implementación es HTML/CSS web (no React Native).

## About the Design Files
Los archivos en `references/` son **referencias de diseño**, no código de producción para copiar literalmente:
- `references/QueFalta (export).html` — la landing completa, **autónoma y funcional** (ábrela en el navegador; el scrollytelling ya funciona). Es la **fuente de verdad visual y de comportamiento**.
- `references/QueFalta.html` — la misma página sin empaquetar (HTML + CSS en `<style>` + scripts).
- `references/app/site.jsx` — el componente React de la landing (hero, showcase, CTA, IntersectionObserver). Útil para portar estructura y copy exactos.
- `references/app/*.jsx` — los **mockups de las pantallas de la app** que se usan como render dentro del iPhone (Home, Catálogo, Productos, Lista, Grupos, Detalle, Perfil). Ver nota de "Phone mockups" abajo.

## Recommended Stack
Cualquier stack web moderno. **Recomendado: Next.js (App Router) o Vite + React** con CSS modules / vanilla CSS (no hace falta Tailwind; los estilos actuales son CSS plano con variables). La página es estática: se puede pre-renderizar (SSG) sin problema. Una sola ruta (`/`).

## Fidelity
**Alta fidelidad.** Colores, tipografía, copy, layout y comportamiento de scroll son finales en el prototipo. Recrear con fidelidad.

---

## Design Tokens (CSS variables)
Defínelas en `:root` (idénticas al prototipo):

```css
:root {
  --paper:      #fbf6ee;   /* fondo de página (crema cálido) */
  --paper-2:    #f6efe3;   /* superficie alternativa */
  --ink:        #2b2521;   /* texto principal / sección oscura */
  --ink-soft:   #8a7f73;   /* texto secundario */
  --ink-faint:  #c2b8a9;   /* texto/numeración tenue */
  --accent:     #df4b2e;   /* tomate (marca) */
  --accent-soft:#fbe7df;   /* fondo de chips de acento */
  --surface:    #ffffff;   /* tarjetas/nav */
  --border:     #ece2d3;   /* hairlines */
  --ok:         #3f8f4f;   /* punto verde "disponible" */
  --geo:   'Space Grotesk', system-ui, sans-serif;  /* UI y titulares */
  --serif: 'Newsreader', Georgia, serif;            /* acentos en cursiva */
}
```

### Tipografía
- **Space Grotesk** (geométrica) — wordmark, titulares, cuerpo, botones. Pesos 400/500/600/700.
- **Newsreader** (serif) — SOLO para palabras en *cursiva* de énfasis: el "*qué falta*" del hero, los números de sección (01–07) y el titular del cierre. Pesos 400/500, ital.
- Cargar vía Google Fonts (o self-host con `next/font`). Wordmark "QueFalta": "Que" en `--ink`, "Falta" en `--accent`, peso 700, `letter-spacing: -0.02em`.

### Otros principios visuales
- **Esquinas:** la UI de marca usa esquinas rectas/poco redondeadas; los chips/píldoras de la web sí usan `border-radius: 999px` (pills) y los botones App Store `14px`. Mantener tal cual el prototipo.
- **Acento editorial:** mezcla de geométrica (estructura) + serif cursiva (calidez) es la firma de marca. No sustituir la serif por más geométrica.

---

## Sections / Views

### 0. Barra de progreso de scroll
Barra fija arriba (`height: 3px`, `--accent`), `transform: scaleX()` 0→1 según el scroll de la página. (`.qf-progress`)

### 1. Nav (sticky)
- Sticky arriba, fondo `rgba(251,246,238,0.82)` + `backdrop-filter: blur(12px)`, borde inferior `--border`.
- Izquierda: wordmark **QueFalta**. Derecha: enlace "Funciones" (#features) + botón "Descargar" (píldora `--ink`, hover `--accent`).
- En móvil (<900px) se ocultan los enlaces de texto.

### 2. Hero
- Grid 2 columnas (texto izquierda / iPhone derecha; en móvil el teléfono va arriba).
- **Pill** "Disponible para iPhone" con punto verde (`--ok`) pulsante-estático.
- **Titular** (`--geo`, 700, hasta ~68px, `line-height: 0.98`): "Sabes siempre / *qué falta* en casa." — "qué falta" en `--serif` italic `--accent`.
- **Descripción** ~17px `--ink-soft`, máx 460px.
- **Acciones:** badge **App Store** (negro, ver componente) + meta "iOS 16+ · Gratis".
- **iPhone:** render de la pantalla de Inicio, ligeramente rotado (`rotate(-3deg)`) sobre un glow radial tomate.
- **Scroll cue** centrado abajo: "Descubre cada pestaña" + chevron con bob animado.

### 3. Showcase (scrollytelling) — núcleo de la página
Grid 2 columnas: **features (izquierda)** + **columna de teléfono sticky (derecha, 380px)**.
- **7 bloques de feature** apilados, cada uno `min-height: 86vh`, centrados verticalmente. Estructura de cada bloque: eyebrow (`nº` en serif italic + nombre en mayúsculas `--accent`), titular (`--geo` 700), descripción (`--ink-soft`), y lista de 3 capacidades con check (cuadradito `--accent` 22px con tick blanco).
- **Teléfono sticky:** `position: sticky; top: 0; height: 100vh`, centrado. Debajo, una **píldora-etiqueta** con el nombre de la pestaña activa + contador "0X / 07".
- **Comportamiento:** un `IntersectionObserver` con `rootMargin: '-50% 0px -50% 0px'` detecta qué bloque está en el centro del viewport y actualiza (a) la pantalla mostrada en el teléfono y (b) la etiqueta; el bloque activo va a opacidad 1, los demás a 0.4. Al cambiar de pantalla, fade-in corto (`@keyframes qf-fade`).
- **Las 7 funciones (en orden), con su copy final:** ver `references/app/site.jsx` (array `FEATURES`) — están redactadas y listas:
  1. **Inicio** — "Toda tu compra, de un vistazo"
  2. **Catálogo** — "Encuentra cualquier producto"
  3. **Productos** — "Añade con un solo toque"
  4. **Mi Lista** — "Marca lo que ya tienes"
  5. **Grupos** — "Comparte la compra con los tuyos"
  6. **En equipo** (detalle de grupo) — "Cada cambio, al instante"
  7. **Tu perfil** — "Tuyo, con tu @usuario"

### 4. CTA / Footer (sección oscura)
- Fondo `--ink`, texto blanco. Wordmark grande (con "Falta" en `--accent`), titular en serif italic "Que no se te olvide nada.", descripción, badge App Store (en versión clara: fondo blanco, texto `--ink`).
- Footer: "© 2026 QueFalta" + enlaces (Privacidad / Términos / Contacto).

---

## Componentes
- **`AppleBadge`** — botón "Descárgalo en el App Store" con el logo de Apple (SVG incluido en `site.jsx`), dos líneas de texto. Variante clara para la sección oscura. Enlazar a la ficha de App Store cuando exista.
- **`PhoneFrame` + screens** — ver nota siguiente.

## Phone mockups (decisión a tomar)
En el prototipo, el "render del móvil" son los **mockups codificados** de la app (`Phone` + las pantallas `*.jsx`), envueltos por un `ThemeCtx` con el tema Mercado Fresco ya resuelto. Para producción hay dos caminos:
- **(A) Recomendado para velocidad:** sustituir cada pantalla por una **captura PNG/WebP real** de la app dentro de un marco de iPhone (componente estático). Más ligero y fiel a la app publicada. Necesitarás 7 capturas (una por función) a ~2–3x para retina.
- **(B) Reusar los mockups en vivo** portando los componentes `app/*.jsx`. Da pantallas nítidas y fáciles de actualizar, pero arrastra el sistema de componentes del prototipo. Solo si quieres mantenerlas "vivas".
> Si vas por (A), pídeme las 7 capturas y te las exporto en alta resolución desde el prototipo.

## Interactions & Behavior
- **Scroll-driven:** IntersectionObserver para la pestaña activa (no atar a `scroll` por rendimiento). El teléfono es `sticky`, no JS de posicionamiento.
- **Smooth scroll** en `<html>` y anclas (#features, #descargar).
- **Reduced motion:** respetar `prefers-reduced-motion` — desactivar el bob del chevron y el fade de cambio de pantalla (mostrar el cambio instantáneo).
- **Accesibilidad:** los bloques de feature son `<article>`; el teléfono es decorativo (marcar `aria-hidden` si se usan capturas) — el contenido textual ya está en la columna izquierda. El badge App Store es un `<a>` con label.

## Responsive
- **Breakpoint principal: 900px.** Por debajo: hero a 1 columna (teléfono arriba), showcase a 1 columna con el **teléfono sticky arriba** (escalado ~0.82) y las features debajo — el teléfono sigue cambiando al hacer scroll. Padding lateral 22px. Enlaces de nav ocultos.
- Revisar también ~1100px (el grid del hero usa columna fija de 360px) y un breakpoint de móvil pequeño (~430px).

## State Management
Mínimo y local: índice de feature activa (de IntersectionObserver) y progreso de scroll. Sin backend, sin datos remotos. Página estática.

## Assets
- **Fuentes:** Space Grotesk + Newsreader (Google Fonts o `next/font`).
- **Iconos:** los pocos iconos (check, chevron, Apple) son SVG inline — copiables desde `site.jsx`. No se necesita librería de iconos.
- **Capturas de pantalla** (si vas por el camino A): 7 imágenes de la app, exportables desde el prototipo a petición.
- **Favicon / OG image:** falta crearlos — sugerencia: marca tomate con el glifo de carrito (mismo del thumbnail del export). Añadir meta OG/Twitter para compartir.

## Files (referencia)
- `references/QueFalta (export).html` — landing autónoma y funcional (abrir en navegador).
- `references/QueFalta.html` — fuente sin empaquetar (todo el CSS está en el `<style>` del head: tómalo como base de estilos).
- `references/app/site.jsx` — estructura React + copy final + lógica de scroll.
- `references/app/*.jsx` — mockups de pantallas (solo si eliges el camino B).

## Orden sugerido de implementación
1. Proyecto web nuevo (Next.js/Vite) + tokens CSS en `:root` + carga de fuentes.
2. Layout y estilos globales (copiar el `<style>` de `QueFalta.html` como punto de partida y modularizar).
3. Nav + Hero + barra de progreso.
4. Showcase con IntersectionObserver y teléfono sticky (decidir camino A o B para el render).
5. CTA/Footer oscuro.
6. Responsive (900px y móvil), `prefers-reduced-motion`, meta OG/favicon.
7. Enlazar el badge a la ficha real de App Store cuando esté disponible.
