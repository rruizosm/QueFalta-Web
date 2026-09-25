# quefalta-web

Web de producto de **QuéFalta** (`quefalta.es`), hecha con [Astro](https://astro.build).
Sirve para tres cosas:

1. **Landing de producto** (`/`) — presenta las funcionalidades de la app.
2. **Puente de invitación** (`/join/:id`) — abre la app si está instalada o
   muestra la descarga si no.
3. **Puente de apertura** (`/inicio`) — destino de los resultados compartidos
   de Palabra de hoy; abre Inicio en la app o muestra las descargas.
4. **Universal Links de iOS** — sirve el fichero de asociación de Apple en
   `/.well-known/apple-app-site-association`.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
npm run preview  # sirve dist/ en local
```

## Despliegue en AWS Amplify

1. Sube esta carpeta a un repositorio de GitHub.
2. En la consola de **AWS Amplify** → New app → Host web app → conecta el repo.
   Amplify detecta Astro; el build usa `amplify.yml` (artefacto: `dist/`).
3. En App settings → Environment variables, añade `STRIPE_SECRET_KEY` (restricted
   key de solo lectura) para que `/apoyar` muestre las cifras reales.
4. En App settings → Domain management, añade `quefalta.es` (y `www`) y apunta el
   DNS según te indique Amplify.

Dos detalles que **deben** quedar bien para no romper los Universal Links ni el
puente de invitación:

- **Content-Type del `apple-app-site-association`**: lo fija `customHttp.yml`
  (`application/json`). No requiere acción manual.
- **Rewrite `/join/:id → /join`**: Amplify NO lo lee de un fichero del repo. Hay
  que crearlo a mano en App settings → Rewrites and redirects:
  - Source: `/join/<*>`
  - Target: `/join/index.html`
  - Type: `200 (Rewrite)`
- **Rewrite del AASA sin redirección**: Amplify convierte actualmente la ruta
  sin extensión en un `301` con barra final, que Apple no admite. Añadir como
  primera regla, antes del 404 genérico:
  - Source: `/.well-known/apple-app-site-association`
  - Target: `/.well-known/apple-app-site-association.json`
  - Type: `200 (Rewrite)`

## Team ID de Apple ✓

El fichero [`public/.well-known/apple-app-site-association`](public/.well-known/apple-app-site-association)
ya tiene el `appID` real y las rutas `/join/*` y `/inicio`: `LX4BLQDZS4.com.quefalta.app` (Team ID `LX4BLQDZS4` +
bundle `com.quefalta.app`). Para que los Universal Links verifiquen, este fichero
debe servirse por HTTPS, sin redirecciones, como `application/json` (ya configurado
en `customHttp.yml`).

## Dominio canónico y redirección de www

La URL principal es `https://quefalta.es`. Las páginas usan barra final y el
canonical, los hreflang y el sitemap deben apuntar a esa misma versión.

La regla de [`docs/amplify-www-redirect.json`](docs/amplify-www-redirect.json)
está **preparada, pendiente de aplicar en Amplify**. Publicar este fichero o
ejecutar el build no activa la redirección: Amplify gestiona las reglas fuera
del repositorio.

En Amplify → Hosting → Rewrites and redirects:

1. Guarda una copia de las reglas actuales para poder revertir.
2. Añade el objeto del JSON como primera regla, conservando las reglas
   existentes, especialmente `/join/<*> → /join/index.html` de tipo `200`.
   No reemplaces toda la lista por el fichero de ejemplo.
3. Si existe una regla inversa de `quefalta.es` a `www.quefalta.es`, sustitúyela
   por la nueva para evitar un bucle. No dupliques una regla ya equivalente.
4. Guarda y comprueba que `https://www.quefalta.es/supermercados/bonpreu/`
   devuelve `301` hacia `https://quefalta.es/supermercados/bonpreu/`.
   Prueba también una URL con parámetros para verificar que se conservan.
5. Comprueba que `/join/<id>` sigue abriendo el puente y que los dos ficheros
   de `/.well-known/` en `quefalta.es` devuelven `200`, `application/json` y
   ninguna redirección.

El origen de una regla de dominio **no lleva ruta ni `/<*>`**. Amplify conserva
la ruta automáticamente. Referencia:
[ejemplos oficiales de AWS](https://docs.aws.amazon.com/amplify/latest/userguide/redirect-rewrite-examples.html).

## Comprobación de SEO después de compilar

```bash
npm run build
node scripts/check-seo.mjs
```

El chequeo revisa el HTML generado: canonical y sitemap coherentes, enlaces
de idiomas recíprocos, datos estructurados y contenido visible de las páginas
modificadas. No certifica el despliegue ni la redirección de dominio en Amplify.
