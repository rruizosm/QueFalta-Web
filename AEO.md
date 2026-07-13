# AEO — Plan de mejora (Answer Engine Optimization)

> Objetivo: que ChatGPT, Perplexity, Gemini, Claude y los AI Overviews de Google
> **citen a QuéFalta** cuando alguien pregunte por apps de lista de la compra
> compartida, precios de supermercados, etc. AEO se construye ENCIMA del SEO ya
> hecho (2026-07-10: smart banner, preload LCP, schema, 404, caché).
>
> Convención: fases F0–F5, cada una desplegable por separado (deploy = push a
> `main`, Amplify publica solo). Marcar ✅ al completar.

---

## Auditoría (2026-07-12) — punto de partida

**Ya a favor (no tocar):**
- `robots.txt` con `Allow: /` global → GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended, etc. ya pueden crawlear. ⚠️ Si algún día se endurece el
  robots, NUNCA bloquear estos bots: sin crawl no hay cita.
- Schema `Organization` + `WebSite` en `Layout.astro` (todas las páginas) +
  `SoftwareApplication` en la home (con URL real del App Store, id6777720373).
- Sitemap automático (`@astrojs/sitemap`, solo excluye `/join` y `/404`) →
  las páginas nuevas entran solas.
- Contenido pre-renderizado (la isla React de la landing también se SSR-iza).
- Prop `jsonld` en `Layout.astro` → añadir schema por página es trivial.

**Lo que falta (el plan):** contenido que responda preguntas (no hay ni FAQ ni
páginas long-tail; solo landing + legales), `llms.txt`, versión en catalán,
presencia en fuentes de terceros, medición.

**⚠️ Regla de oro del contenido:** la web solo puede afirmar lo que la app
PUBLICADA tiene (hoy: **6 supermercados** — Mercadona, Carrefour, Consum, Dia,
Bonpreu/Esclat, bonÀrea). Sorli/Eroski/Caprabo/Condis/Ametller/Aldi están en
código pero SIN desplegar → no mencionarlos hasta que lleguen a producción
(entonces: añadir su página F2 + actualizar cifras en FAQ/llms.txt).

---

## Reglas de redacción "citable" (aplican a TODA página nueva)

Los answer engines extraen fragmentos autocontenidos. Cada sección debe poder
citarse sola:

1. **Encabezados en forma de pregunta** (`## ¿QuéFalta es gratis?`).
2. **Respuesta directa en el PRIMER párrafo**, 40–60 palabras, sin rodeos ni
   marketing. Detalle después, para humanos.
3. **Datos concretos**: cifras (6 supermercados, ~50.000 productos, gratis),
   nombres propios, "actualizado semanalmente". Nada de "muchos" o "varios".
4. **Fecha visible** de última actualización en páginas de contenido
   (los engines penalizan contenido que parece rancio).
5. **Astro puro, sin islas React**: HTML simple = extracción fiable.
6. Español neutro; la versión catalana llega en F3 (no traducir a medias).

---

## F0 — Quick wins técnicos (~30 min) ✅ criterio: llms.txt servido en prod

- [x] **`public/llms.txt`** ✅ 2026-07-12: markdown para agentes LLM (qué es,
  funciones, 6 supers, plataformas, páginas clave, contacto). ⚠️ Mantenerlo
  al día es parte del checklist de cada release importante (súper nuevo,
  Android, funciones grandes).
- [x] **`robots.txt`** ✅ 2026-07-12: comentario apuntando a `/llms.txt` y
  recordatorio de no bloquear bots de IA. El `Allow` intacto.
- [ ] Verificar TRAS DEPLOY: `https://quefalta.es/llms.txt` responde 200 con
  `Content-Type: text/plain` (si Amplify lo sirve raro, fijarlo en
  `customHttp.yml` como se hizo con el AASA).

## F1 — Página de preguntas frecuentes (`/preguntas`) — la pieza central

✅ CÓDIGO COMPLETO 2026-07-12 (build verde, `/preguntas` en el sitemap,
schema `FAQPage` en el HTML generado). Pendiente solo: deploy + validar el
schema con https://search.google.com/test/rich-results.

- [x] Página Astro pura (`src/pages/preguntas.astro`) con 12 preguntas, cada
  una con su respuesta-directa-primero (el array `FAQS` alimenta a la vez el
  HTML y el schema — editar SOLO ahí):
  - ¿Qué app puedo usar para compartir la lista de la compra con mi familia?
  - ¿Hay alguna app de lista de la compra en tiempo real?
  - ¿Qué app tiene los precios reales de Mercadona? (y variantes Consum/Dia…)
  - ¿QuéFalta es gratis? ¿Tiene anuncios?
  - ¿En qué supermercados funciona QuéFalta?
  - ¿QuéFalta está en catalán?
  - ¿Está disponible para Android? (respuesta honesta: en camino)
  - ¿Cómo se comparten las listas? ¿Cuánta gente puede haber en un grupo?
  - ¿De dónde salen los precios y cada cuánto se actualizan?
  - ¿Qué pasa con mis datos? (enlazar /privacidad)
- [x] **Schema `FAQPage`** vía la prop `jsonld` de `Layout` (mismo texto que el
  visible — Google exige que coincidan; por eso HTML y schema salen del mismo
  array `FAQS`).
- [x] Fecha "Actualizado el …" visible arriba (const `UPDATED` — actualizarla
  al tocar cualquier respuesta).
- [x] Enlaces: "Preguntas" y "Supermercados" en los DOS footers (el genérico
  de `Layout.astro` y el de la landing en `Landing.jsx`) Y en el `SiteNav`
  (petición del usuario 2026-07-12; el breakpoint móvil del nav subió de 980
  a 1080px para que quepan los 6 enlaces en escritorio). Aprovechando:
  "Eliminar cuenta" salió de los footers y ahora se enlaza desde
  `/privacidad` §7 (⚠️ la página `/eliminar-cuenta` NO se borra: es la URL
  declarada en Play Console → Data Safety).
- [ ] Enlazar desde la FAQ a las páginas F2 cuando existan (interlinking).

## F2 — Páginas por supermercado (`/supermercados/…`) — el long-tail

Cada súper es una consulta distinta ("app con precios de Consum") que hoy nadie
responde bien. Solo los 6 vivos.

✅ CÓDIGO COMPLETO 2026-07-12 (build verde, las 7 URLs en el sitemap, schemas
en el HTML). El contenido de cada súper vive en `src/data/supermercados.js`
(un solo sitio para editar; alimenta índice, páginas y schemas a la vez).
Pendiente solo: deploy + rich results test de una página de súper.

- [x] Índice `/supermercados` (tarjetas + `ItemList` + `BreadcrumbList`).
- [x] 6 páginas `/supermercados/{mercadona,carrefour,consum,dia,bonpreu,bonarea}`
  vía ruta dinámica `[store].astro`; plantilla común con contenido ÚNICO por
  súper (intro, metas, bullets y 2 FAQs propias cada una):
  - Cifras prudentes que aguantan la fluctuación semanal: Carrefour "más de
    15.000", Consum "en torno a 9.000", Dia "más de 5.000", Mercadona
    "catálogo completo", Bonpreu/bonÀrea "miles".
  - Ficha de producto: afirmada en Mercadona/Carrefour/Dia/bonÀrea; en Consum
    se dice honestamente que NO la hay (Consum no la publica).
  - Catalán: afirmado en Mercadona (nombres), Bonpreu (nativo) y bonÀrea
    (catálogo + ficha).
  - ⚠️ NO se mencionan comparativa (flag apagado) ni ofertas de Carrefour
    (backend vivo pero la UI no está en el build 34 publicado).
- [x] Schema `BreadcrumbList` + `FAQPage` (2 preguntas) en las 6.
- [x] Enlaces cruzados: chips de la landing → página de cada súper + enlace
  "Qué ofrece cada supermercado →" al índice; FAQ ↔ páginas de súper;
  "Supermercados" en los DOS footers; llms.txt lista las 7 URLs.
- [x] Disclaimer de no afiliación en índice y en las 6 páginas.
- [ ] (Opcional) capturas de la app por súper cuando haya buenas.
- [ ] RUNBOOK al desplegar un súper nuevo en la app: añadir su entrada en
  `src/data/supermercados.js` + SUPERS de `Landing.jsx` + FAQ + llms.txt.

## F3 — Catalán (`/ca/…`) — ventaja competitiva casi sin competencia

Para consultas en catalán ("app llista de la compra compartida") no hay nadie:
ser la única respuesta bien estructurada. La app YA es bilingüe; la web no.

✅ CÓDIGO COMPLETO 2026-07-12 (build verde, 19 páginas; /ca/ y /ca/preguntes
en el sitemap; hreflang verificados en el HTML de las 4 páginas con par).

- [x] `Layout.astro`: prop `lang` (default `es`) que gobierna `<html lang>`,
  `og:locale` (+ `og:locale:alternate`), `inLanguage` del `WebSite` schema y
  el PIE traducido (labels `T`). `SiteNav` también acepta `lang` (enlaces a
  /ca/ y sus anclas; scroll-spy generalizado a cualquier home).
- [x] `/ca/` (home estática Astro puro, sin isla React: hero respuesta-directa,
  chips de supers → páginas F2, 3 pasos, 6 funciones, CTA; anclas
  `#com-funciona`/`#funcions`/`#descarrega` que usa el nav) + `/ca/preguntes`
  (las 12 FAQs traducidas, FAQPage `inLanguage: ca`). ⚠️ Las DOS versiones de
  la FAQ deben mantenerse sincronizadas a mano (es ↔ ca) — está avisado en
  los dos ficheros. Los `/ca/supermercats/...` después, si la FAQ ca trae
  tráfico.
- [x] `hreflang` recíprocos (`es` ↔ `ca` + `x-default` → es) vía prop
  `alternates` de Layout, en las 4 páginas con par (`/`, `/ca/`, `/preguntas`,
  `/ca/preguntes`) + enlace visible "també en català"/"también en castellano"
  entre las dos FAQ.
- [x] Sitemap incluye las `/ca/` (verificado tras build) y llms.txt las lista.

## F4 — Presencia en fuentes de terceros (manual, sin código)

La mitad del AEO: cuando alguien pregunta "mejor app de lista de la compra",
los engines citan comparativas, Reddit y directorios — no la web del producto.

- [ ] **AlternativeTo**: crear la ficha de QuéFalta (legítimo hacerlo uno
  mismo; listar como alternativa a Bring!, Listonic, AnyList).
- [ ] **Product Hunt**: lanzamiento (preparar assets; ya hay capturas de
  marketing/appstore).
- [ ] **Reddit y foros en español** (r/es, r/askspain, forocoches, foros de
  ahorro): responder donde YA se pregunta por apps de lista de la compra,
  con transparencia (soy el desarrollador). Reddit es de lo más citado
  por los answer engines. Ritmo natural, nunca spam.
- [ ] Contactar 2–3 blogs/medios de apps en español (Xataka Móvil, Andro4all
  cuando haya Android…) — una mención con enlace vale más que 10 páginas
  propias.
- [ ] Ficha del App Store: ya publicada ✅ (los engines la leen). Mantener
  keywords/descripción al día con cada súper nuevo.

## F5 — Medición (mensual, ~15 min)

- [ ] **GA4** (ya instalada, tras consentimiento): revisar referrers
  `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`.
  ⚠️ Infracuenta (solo usuarios que aceptan cookies): tomar como tendencia,
  no como cifra absoluta.
- [ ] **Search Console**: verificar la propiedad si no lo está; vigilar
  impresiones de las páginas F1/F2 y las consultas-pregunta.
- [ ] **Prueba manual mensual** con prompts fijos (apuntar resultado y fecha):
  1. "¿Qué app puedo usar para compartir la lista de la compra con mi pareja?"
  2. "app lista de la compra con precios de Mercadona"
  3. "quina app puc fer servir per la llista de la compra compartida?"
  4. "alternativas a Bring! en España"
  → en ChatGPT, Perplexity y Google (AI Overview). Apuntar: ¿aparece QuéFalta?
  ¿qué fuente citan? (esa fuente es donde hay que estar → alimenta F4).

---

## Orden recomendado y estado

| Fase | Qué | Esfuerzo | Estado |
|------|-----|----------|--------|
| F0 | llms.txt | 30 min | ✅ código 2026-07-12 (falta deploy + check Content-Type) |
| F1 | FAQ + FAQPage schema | ½ día | ✅ código 2026-07-12 (falta deploy + rich results test) |
| F2 | 6 páginas de súper + índice | 1–2 días | ✅ código 2026-07-12 (falta deploy + rich results test) |
| F3 | Catalán (FAQ + home) | ½–1 día | ✅ código 2026-07-12 (falta deploy) |
| F4 | Terceros (AlternativeTo, PH, Reddit, prensa) | continuo | ⬜ |
| F5 | Medición mensual | 15 min/mes | ⬜ |

F0+F1 pueden ir en el mismo deploy. F4 puede empezar en paralelo desde ya
(no depende de código). F5 arranca cuando F1 esté en prod.
