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

## Despliegue en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → New Project → importa el repo.
   Vercel detecta Astro automáticamente.
3. En Settings → Domains, añade `quefalta.es` (y `www`) y apunta el DNS según
   te indique Vercel.

`vercel.json` ya configura:
- El **rewrite** `/join/:id → /join` (para que cualquier id sirva la página puente).
- El **Content-Type** `application/json` del fichero `apple-app-site-association`.

## Team ID de Apple ✓

El fichero [`public/.well-known/apple-app-site-association`](public/.well-known/apple-app-site-association)
ya tiene el `appID` real: `LX4BLQDZS4.com.quefalta.app` (Team ID `LX4BLQDZS4` +
bundle `com.quefalta.app`). Para que los Universal Links verifiquen, este fichero
debe servirse por HTTPS, sin redirecciones, como `application/json` (ya configurado
en `vercel.json`).

## Pendiente: URL de App Store

En [`src/pages/join/index.astro`](src/pages/join/index.astro) y en la landing,
sustituye los `#` / `APP_STORE_URL` por el enlace real de la ficha cuando publiques.
