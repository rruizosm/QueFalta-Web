import { foodIndexColor, foodIndexLevel, foodIndexTextColor, foodPointScore } from '../../lib/indiceAlimentario.js';
import { useT } from './i18n.jsx';

// Índice alimentario de la ficha (como el de la app): nota 0-100, cómo se
// calcula, puntos positivos y negativos y, con Open Food Facts, NOVA y aditivos.

const fmtNumber = (n, lang) => n.toLocaleString(lang === 'ca' ? 'ca-ES' : 'es-ES', { maximumFractionDigits: 1 });

/** Círculo con la nota, reutilizado en el resumen del producto. */
export function FoodIndexBadge({ info, href }) {
  const t = useT();
  const { score } = info.foodIndex;
  return (
    <a className="pd-fi-badge" href={href}>
      <span className="pd-fi-dot" style={{ background: foodIndexColor(score), color: foodIndexTextColor(score) }}>{score}</span>
      <span>
        <strong>{t.fi.title}</strong>
        <em style={{ color: foodIndexColor(score) }}>{t.fi.levels[foodIndexLevel(score)]}</em>
      </span>
    </a>
  );
}

function Points({ title, hint, empty, points }) {
  const t = useT();
  const total = points.reduce((s, p) => s + p.points, 0);
  const max = points.reduce((s, p) => s + p.pointsMax, 0);
  return (
    <div className="pd-fi-block">
      <div className="pd-fi-block-head">
        <div><h3>{title}</h3><p>{hint}</p></div>
        {max > 0 && <span className="pd-fi-total">{total}/{max}</span>}
      </div>
      {points.length ? (
        <ul className="pd-fi-points">
          {points.map((p) => {
            const color = foodIndexColor(foodPointScore(p));
            const value = p.id === 'sweeteners' ? t.fi.present : `${fmtNumber(p.value, t.lang)}${p.unit ? ` ${p.unit}` : ''}${p.unit === '%' || !p.unit ? '' : ' / 100 g/ml'}`;
            return (
              <li key={`${p.kind}:${p.id}`}>
                <div className="pd-fi-point-head">
                  <span><strong>{t.fi.points[p.id] ?? p.id.replace(/_/g, ' ')}</strong><em>{value}</em></span>
                  <b style={{ background: color, color: foodIndexTextColor(foodPointScore(p)) }}>{p.points}/{p.pointsMax}</b>
                </div>
                <span className="pd-fi-track"><span style={{ width: `${(p.points / p.pointsMax) * 100}%`, background: color }} /></span>
              </li>
            );
          })}
        </ul>
      ) : <p className="pd-fi-empty">{empty}</p>}
    </div>
  );
}

export default function FoodIndexCard({ info }) {
  const t = useT();
  const index = info.foodIndex;
  const color = foodIndexColor(index.score);
  const formula = index.components.map((c) => `${c.weight}% ${t.fi.components[c.id].toLocaleLowerCase()}`).join(' + ');
  const fromOff = info.source === 'openfoodfacts';

  return (
    <section className="pd-card pd-fi" id="indice" aria-labelledby="pd-fi-title">
      <div className="pd-fi-hero">
        <span className="pd-fi-circle" style={{ background: color, color: foodIndexTextColor(index.score) }}>
          <strong>{index.score}</strong><span>/100</span>
        </span>
        <div>
          <h2 id="pd-fi-title">{t.fi.title}</h2>
          <p className="pd-fi-level" style={{ color }}>{t.fi.levels[foodIndexLevel(index.score)]}</p>
          <p className="pd-fi-formula">{formula}</p>
        </div>
      </div>

      <div className="pd-fi-block">
        <div className="pd-fi-block-head"><div><h3>{t.fi.howTitle}</h3><p>{t.fi.howNote}</p></div></div>
        <ul className="pd-fi-components">
          {index.components.map((c) => (
            <li key={c.id}>
              <div className="pd-fi-point-head">
                <strong>{t.fi.components[c.id]}</strong>
                <em>{t.fi.componentResult(Math.round(c.score), c.weight, fmtNumber((c.score * c.weight) / 100, t.lang))}</em>
              </div>
              <span className="pd-fi-track"><span style={{ width: `${c.score}%`, background: foodIndexColor(c.score) }} /></span>
            </li>
          ))}
        </ul>
        {index.components.length < 3 && <p className="pd-fi-note">{t.fi.partialNote}</p>}
      </div>

      <Points title={t.fi.positiveTitle} hint={t.fi.positiveHint} empty={t.fi.noPositive} points={index.positivePoints} />
      <Points title={t.fi.negativeTitle} hint={t.fi.negativeHint} empty={t.fi.noNegative} points={index.negativePoints} />

      {fromOff && (
        <>
          <div className="pd-fi-block">
            <div className="pd-fi-block-head"><div><h3>{t.fi.processingTitle}</h3><p>{t.fi.processingHint}</p></div></div>
            {info.novaGroup === 4
              ? <p className="pd-fi-flag"><strong>{t.fi.ultraTitle}</strong> {t.fi.ultraDetail}</p>
              : <p className="pd-fi-empty">{t.fi.processingNone}</p>}
          </div>
          <div className="pd-fi-block">
            <div className="pd-fi-block-head"><div><h3>{t.fi.additivesTitle}</h3><p>{t.fi.additivesHint}</p></div></div>
            {info.additives.length ? (
              <ul className="pd-fi-additives">
                {info.additives.map((a) => <li key={a.code}><strong>{a.code}</strong>{a.name ?? t.fi.additiveItem}</li>)}
              </ul>
            ) : <p className="pd-fi-empty">{t.fi.additivesNone}</p>}
          </div>
        </>
      )}

      <p className="cmp-note">
        {fromOff ? t.fi.sourceOff : info.source === 'mercadona' ? t.fi.sourceMercadona : t.fi.sourceCatalog} {t.fi.disclaimer}
      </p>
    </section>
  );
}
