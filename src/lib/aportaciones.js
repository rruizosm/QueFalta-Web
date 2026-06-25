// aportaciones.js — lee las aportaciones reales desde Stripe en tiempo de build.
//
// Necesita la variable de entorno STRIPE_SECRET_KEY. Recomendado: usar una
// "restricted key" de Stripe con permiso de SOLO LECTURA sobre Payment Intents,
// no la clave secreta completa. Configúrala en Vercel (Project Settings →
// Environment Variables) y, para probar en local, en un archivo .env (ignorado
// por git). Sin la clave, devuelve cero y la web compila igualmente.
//
// Como la web es estática, la cifra se calcula al compilar y se actualiza en
// cada publicación/despliegue (no en tiempo real).

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeGet(path, key, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${STRIPE_API}/${path}${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`Stripe ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

const VACIO = { total: 0, count: 0, porMes: [], live: false };

export async function getAportaciones() {
  const key = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) return VACIO;

  try {
    // Recorre todos los Payment Intents pagados, con paginación.
    const pagos = [];
    let startingAfter;
    for (let i = 0; i < 100; i++) { // tope de seguridad: 100 páginas
      const params = { limit: '100' };
      if (startingAfter) params.starting_after = startingAfter;
      const page = await stripeGet('payment_intents', key, params);

      for (const pi of page.data) {
        if (pi.status === 'succeeded' && pi.currency === 'eur') {
          pagos.push({ amount: pi.amount_received, created: pi.created });
        }
      }
      if (!page.has_more || page.data.length === 0) break;
      startingAfter = page.data[page.data.length - 1].id;
    }

    const totalCent = pagos.reduce((s, p) => s + p.amount, 0);

    // Agrega por mes para el libro de movimientos (un ingreso por mes).
    const meses = new Map();
    for (const p of pagos) {
      const d = new Date(p.created * 1000);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const acc = meses.get(ym) || { cent: 0, last: 0 };
      acc.cent += p.amount;
      acc.last = Math.max(acc.last, p.created);
      meses.set(ym, acc);
    }
    const porMes = [...meses.values()].map((m) => {
      const d = new Date(m.last * 1000);
      const fecha = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { fecha, tipo: 'ingreso', concepto: 'Aportaciones de la comunidad', importe: m.cent / 100 };
    });

    return { total: totalCent / 100, count: pagos.length, porMes, live: true };
  } catch (err) {
    // No rompemos el build si Stripe falla: avisamos y caemos a cero.
    console.warn('[aportaciones] No se pudo leer Stripe:', err.message);
    return VACIO;
  }
}
