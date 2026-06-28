# quefalta-web

Web de producto de **QuéFalta** (`quefalta.es`), hecha con [Astro](https://astro.build).
Sirve para tres cosas:

1. **Landing de producto** (`/`) — presenta las funcionalidades de la app.
2. **Puente de invitación** (`/join/:id`) — abre la app si está instalada o
   muestra la descarga si no.
3. **Universal Links de iOS** — sirve el fichero de asociación de Apple en
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

## Team ID de Apple ✓

El fichero [`public/.well-known/apple-app-site-association`](public/.well-known/apple-app-site-association)
ya tiene el `appID` real: `LX4BLQDZS4.com.quefalta.app` (Team ID `LX4BLQDZS4` +
bundle `com.quefalta.app`). Para que los Universal Links verifiquen, este fichero
debe servirse por HTTPS, sin redirecciones, como `application/json` (ya configurado
en `customHttp.yml`).

## Pendiente: URL de App Store

En [`src/pages/join/index.astro`](src/pages/join/index.astro) y en la landing,
sustituye los `#` / `APP_STORE_URL` por el enlace real de la ficha cuando publiques.
