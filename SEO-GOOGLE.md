# Guía SEO de Google: resumen práctico

Resumen en castellano de la **SEO Starter Guide** oficial de Google Search Central, para consultarlo antes de tocar el SEO de quefalta.es.

- Fuente: <https://developers.google.com/search/docs/fundamentals/seo-starter-guide>
- Leída el 2026-11-13. La versión `?hl=es` devuelve el mismo texto en inglés, así que los términos en castellano son traducción propia (entre paréntesis va el término original).
- Es un resumen con mis palabras, no una copia. Si hay dudas, manda el original.

---

## La idea central

1. **No hay trucos.** Google lo dice claro: nada garantiza salir el primero. Lo que más pesa es que **el contenido sea útil e interesante** (sección 5), por encima de cualquier ajuste técnico.
2. **La base son las [Search Essentials](https://developers.google.com/search/docs/essentials)** (requisitos técnicos, políticas de spam y buenas prácticas). Cumplirlas no asegura que te indexen, pero lo hace más probable.
3. **Paciencia.** Un cambio puede notarse en horas o tardar meses. Espera **unas semanas** antes de juzgar si ha funcionado. Algunos cambios no tienen efecto visible: si no convence, itera.

---

## 1. Cómo encuentra Google tu web

- Los rastreadores (crawlers) recorren la web siguiendo enlaces. Casi todas las webs se descubren solas, sin hacer nada especial.
- **¿Estoy indexado?** Busca `site:quefalta.es` en Google. Si salen resultados, estás en el índice. Si no, revisa los [requisitos técnicos](https://developers.google.com/search/docs/essentials/technical).
- **Enlaces de otras webs:** son la vía principal de descubrimiento. Llegan con el tiempo y promocionando la web (sección 8).
- **Sitemap:** opcional. Ayuda, pero Google insiste en que antes importa que la gente conozca la web. [Guía de sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

### Que Google vea lo mismo que el usuario

- Google tiene que poder cargar los mismos recursos que el navegador (**CSS y JS incluidos**). Si los bloqueas, puede no entender la página y posicionarla peor.
- Si el contenido cambia según la ubicación, comprueba qué ve Googlebot (suele rastrear **desde EE. UU.**).
- Herramienta: **[Inspección de URLs de Search Console](https://support.google.com/webmasters/answer/9012289)**.

### Ocultar páginas de los resultados

- Se puede excluir la web entera, carpetas o archivos sueltos (`noindex`, robots.txt, contraseña…). [Cómo bloquear contenido](https://developers.google.com/search/docs/crawling-indexing/control-what-you-share#how-to-block-content).

---

## 2. Organización de la web

> Aviso de Google: **no reorganices todo de golpe**. Google entiende las páginas tal como están; estos principios ayudan a largo plazo, sobre todo en webs grandes.

### URLs descriptivas

| ✅ Haz | ❌ Evita |
|---|---|
| `example.com/pets/cats.html` | `example.com/2/6772756D707920636174` |
| Palabras que el usuario entienda | IDs aleatorios sin significado |

- Partes de la URL pueden salir como **migas de pan (breadcrumbs)** en el resultado. Se pueden forzar con [datos estructurados de breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

### Agrupar por temas en carpetas

- A partir de **unos pocos miles de URLs**, la estructura influye en cómo rastrea Google: aprende cada cuánto cambia cada carpeta y la rastrea a su ritmo.
- Ejemplo: `/policies/…` (cambia poco) frente a `/promotions/…` (cambia mucho).
- Webs tipo tienda o catálogo: hay una [guía específica de ecommerce](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure).

### Contenido duplicado

- Mismo contenido en varias URLs → Google elige una **canónica**.
- **No es spam ni causa penalización.** Solo desperdicia rastreo.
- Lo ideal: **una sola URL por contenido**.
  - Si hay duplicadas → **redirección 301** a la buena ([guía](https://developers.google.com/search/docs/crawling-indexing/301-redirects)).
  - Si no se puede redirigir → `<link rel="canonical">` ([canonicalización](https://developers.google.com/search/docs/crawling-indexing/canonicalization), [consolidar duplicados](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)).
- Google también dice que no hay que obsesionarse: suele resolverlo solo.

---

## 3. Contenido útil (lo que más pesa)

Atributos del buen contenido:

- **Fácil de leer y ordenado:** escrito con naturalidad, sin faltas, con párrafos, secciones y encabezados.
- **Original:** nada copiado ni reciclado. Basado en conocimiento propio. Copiar contenido ajeno sí infringe las [políticas de spam](https://developers.google.com/search/docs/essentials/spam-policies#scraped-content).
- **Al día:** revisar lo publicado y actualizarlo o borrarlo cuando caduque.
- **Fiable y pensado para personas:** que se note la experiencia o pericia de quien lo escribe. [Crear contenido útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

### Pensar en cómo busca la gente

- Un experto y un novato buscan con palabras distintas (ejemplo de Google: «charcuterie» frente a «cheese board»).
- Conviene cubrir variantes, pero **no hace falta usar el término exacto**: Google entiende sinónimos y relaciones.

### Publicidad

- Los anuncios están bien mientras **no impidan leer ni usar la página**.
- Evita intersticiales intrusivos ([guía](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials)).

### Enlaces

- La gran mayoría de páginas nuevas se descubren por enlaces, así que enlazar bien entre tus páginas importa.
- **Texto del enlace (anchor) descriptivo:** que diga de qué va la página enlazada, no «haz clic aquí». [Guía](https://developers.google.com/search/docs/crawling-indexing/links-crawlable#write-good-anchor-text).
- Enlaza a fuentes en las que confíes. Si enlazas a algo de lo que no te fías, añade **`rel="nofollow"`** ([calificar enlaces salientes](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)).
- **Enlaces de usuarios** (comentarios, foros): el sistema debe ponerles `nofollow` automáticamente.

---

## 4. Cómo se ve tu web en los resultados

Dos piezas controlables ([galería de elementos visuales](https://developers.google.com/search/docs/appearance/visual-elements-gallery)):

### Título del enlace (title link)

- Sale del `<title>` y de los encabezados de la página. También es el título de la pestaña y los marcadores.
- **Único por página**, claro, conciso y fiel al contenido.
- Puede incluir el nombre de la marca, la ubicación (si aplica) y lo que ofrece la página.
- [Guía de títulos](https://developers.google.com/search/docs/appearance/title-link).

### Fragmento (snippet) y meta description

- El fragmento sale del **contenido real de la página**. A veces Google usa la `meta description`.
- Buena meta description: **corta (1–2 frases), única por página** y con lo más relevante.
- [Guía de fragmentos](https://developers.google.com/search/docs/appearance/snippet#meta-descriptions).

---

## 5. Imágenes

- **Nítidas y de calidad**, para que se entienda qué muestran.
- **Cerca del texto que las describe**: ese texto da el contexto a Google.
- **`alt` descriptivo**: explica qué muestra la imagen y su relación con el contenido. [Guía](https://developers.google.com/search/docs/appearance/google-images#descriptive-alt-text).

## 6. Vídeos

- Cada vídeo importante en **su propia página**, incrustado cerca del texto relacionado.
- **Título y descripción** del vídeo bien escritos (aplican las mismas reglas que los títulos).
- Webs con mucho vídeo: [guía de vídeo](https://developers.google.com/search/docs/appearance/video).

---

## 7. Promoción

- Redes sociales, comunidades, publicidad online y offline, boca a boca.
- El **boca a boca** es de lo más eficaz y duradero, pero exige trabajo previo en comunidades.
- Offline: la URL en tarjetas, carteles, materiales… Boletines solo con permiso.
- ⚠️ **Sin pasarse**: la promoción excesiva cansa y algunas prácticas cuentan como manipulación ([políticas de spam](https://developers.google.com/search/docs/essentials/spam-policies)).

---

## 8. Mitos: lo que Google dice que NO importa (o casi)

| Tema | Qué dice Google |
|---|---|
| **Meta keywords** | No se usan. Nada. |
| **Relleno de palabras clave** | Repetir palabras en exceso molesta y **va contra las políticas de spam**. |
| **Keywords en el dominio o la URL** | Apenas influyen en el ranking (salvo si salen en las migas de pan). Elige el nombre por negocio. |
| **TLD (.com, .es, .guru…)** | Solo cuenta si apuntas a un país concreto, y aun así pesa poco. |
| **Longitud del texto** | No hay número mágico de palabras. Lo que importa es que haya contenido real. |
| **Subdominio o subdirectorio** | Decisión de negocio. Los subdirectorios suelen ser más fáciles de gestionar. |
| **PageRank** | Existe y usa enlaces, pero es solo una señal entre muchas. |
| **«Penalización» por duplicado** | No existe. Solo es ineficiente. (Copiar de otros sí es problema.) |
| **Número y orden de encabezados** | A Google le da igual. Al lector de pantalla no: mantenlos en orden por accesibilidad. |
| **E-E-A-T** | **No es un factor de ranking.** Es un criterio para evaluar calidad. |

---

## 9. Siguientes pasos que recomienda Google

1. **[Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start)** para vigilar indexación y rendimiento.
2. **[Datos estructurados](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)** para optar a resultados enriquecidos (estrellas, carruseles…). [Galería de tipos](https://developers.google.com/search/docs/appearance/structured-data/search-gallery).
3. **[Mantenimiento a largo plazo](https://developers.google.com/search/docs/fundamentals/get-started)**: migraciones, webs multiidioma, etc.

Para estar al día: [blog de Search Central](https://developers.google.com/search/blog), [foro de la comunidad](https://support.google.com/webmasters/community) y [canal de YouTube](https://www.youtube.com/c/GoogleSearchCentral).

---

## 10. Aplicado a quefalta.es: checklist

Lista para revisar cada vez que se toque la web. No es una auditoría del estado actual.

**Indexación**
- [ ] `site:quefalta.es` devuelve las páginas clave (home, `/precios/`, `/supermercados/…`, `/ofertas/…`, fichas de producto).
- [ ] Search Console sin errores de cobertura nuevos tras cada despliegue.
- [ ] El sitemap incluye las páginas nuevas (fichas, ofertas, supermercados) y las versiones en catalán.
- [ ] CSS y JS no bloqueados en `robots.txt`. Inspección de URL muestra la página renderizada completa.

**Duplicados y canónicas**
- [ ] Cada ficha de producto tiene **una sola URL canónica**. Las fichas que se sirven por `/producto/?p=` no deben competir con la versión estática `/producto/<súper>/<id>/`.
- [ ] Versiones `es` y `ca` con `hreflang` entre sí, no tratadas como duplicadas.
- [ ] Redirecciones antiguas como 301 (ojo: la 404 de Amplify responde con 302).

**Cada página**
- [ ] `<title>` único y descriptivo (producto + súper + precio, o cadena + «ofertas»).
- [ ] `meta description` única, 1–2 frases, con lo relevante.
- [ ] Encabezados en orden (por accesibilidad, no por Google).
- [ ] Imágenes de producto y logos con `alt` descriptivo.
- [ ] Enlaces internos con texto descriptivo (p. ej. «ofertas de Bonpreu», no «ver más»).

**Contenido**
- [ ] Texto propio y útil (comparativas, contexto). Nada copiado de las webs de los súpers.
- [ ] Datos al día: las páginas que muestran precios se recompilan con cada sync. Retirar lo caducado.
- [ ] La web solo afirma lo que hace la app publicada (regla de [AEO.md](AEO.md)).

**Anuncios**
- [ ] AdSense y el aviso de consentimiento no tapan el contenido ni actúan como intersticial intrusivo en móvil.

**Datos estructurados**
- [ ] Validar el schema (Product/Offer, BreadcrumbList, FAQ…) con la prueba de resultados enriquecidos tras cada cambio.

**No perder el tiempo en**
- Meta keywords, densidad de palabras clave, número de palabras ni «autoridad E-E-A-T» como si fuera una puntuación.
