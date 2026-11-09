import { useEffect, useState } from 'react';
import { STORE_BY_KEY } from '../../data/comparadorZonas.js';
import { findSimilar, keyWords } from '../../lib/comparadorApi.js';
import { productPath } from '../../lib/productoApi.js';
import { Icon, ProductImage, StoreLogo, UNIT_LABEL, fmt, ppuText } from './ui.jsx';
import { useT } from './i18n.jsx';

// Lateral de la ficha de producto: la comparación que antes salía en el panel
// emergente (la opción más barata parecida de cada súper de la zona).

function NeedZone({ onEditZone }) {
  const t = useT();
  return (
    <div className="cmp-verdict is-best pd-needzone">
      <span className="cmp-verdict-icon"><Icon.pin width="20" height="20" /></span>
      <div>
        <span>{t.pdNeedZoneText}</span>
        <button type="button" className="cmp-btn cmp-btn-primary" onClick={onEditZone}>
          {t.pdNeedZoneCta}
          <Icon.arrow width="16" height="16" />
        </button>
      </div>
    </div>
  );
}

export default function CompareAside({ product, cp, zoneStores, exact = [], onEditZone }) {
  const t = useT();
  const [state, setState] = useState({ status: 'loading', rows: [product], failed: [], keys: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!cp || !product) return undefined;
    const ctrl = new AbortController();
    setState({ status: 'loading', rows: [product], failed: [], keys: [] });
    findSimilar(product, { cp, stores: zoneStores.map((s) => s.key), signal: ctrl.signal, lang: t.lang })
      .then((res) => { if (res) setState({ status: 'done', ...res }); })
      .catch(() => { if (!ctrl.signal.aborted) setState((s) => ({ ...s, status: 'error' })); });
    return () => ctrl.abort();
    // El producto cambia de objeto al refrescar su precio: basta con su uid y precio.
  }, [product?.uid, product?.price, cp, zoneStores, attempt, t.lang]);

  const head = (
    <header className="pd-aside-head">
      <span className="cmp-eyebrow">{t.cmpEyebrow}</span>
      <h2>{t.pdNeedZoneTitle}</h2>
    </header>
  );

  if (!cp) {
    return <>{head}<div className="pd-aside-body"><NeedZone onEditZone={onEditZone} /></div></>;
  }

  const { status, failed, keys } = state;
  const done = status === 'done';
  // El mismo producto (EAN) entra en las cadenas donde el nombre no encontró nada.
  const exactUids = new Set(exact.map((r) => r.uid));
  const rows = done
    ? [...state.rows, ...exact.filter((r) => !state.rows.some((x) => x.store === r.store))]
      .sort((a, b) => (a.ppu != null && b.ppu != null ? a.ppu - b.ppu : a.price - b.price))
    : state.rows;
  const comparable = rows.filter((r) => r.ppu != null);
  const best = comparable[0] ?? rows[0];
  const saving = product.ppu != null && best.ppu != null ? product.ppu - best.ppu : 0;
  const savingPct = product.ppu ? Math.round((saving / product.ppu) * 100) : 0;
  const max = Math.max(...comparable.map((r) => r.ppu), 0.0001);
  const unitWord = t.units[product.unit] ?? null;
  const missing = done ? zoneStores.filter((s) => !rows.some((r) => r.store === s.key) && !failed.includes(s.key)) : [];
  // Las claves salen del nombre canónico (castellano); el título, del que se ve.
  const shownKeys = keys.length ? keyWords(product.label) : [];
  const title = shownKeys.length ? shownKeys.join(' ') : product.label;

  let verdict;
  if (status === 'error') {
    verdict = { cls: 'is-loading', icon: <Icon.search width="20" height="20" />, title: t.cmpFailed, sub: t.checkConnection, retry: true };
  } else if (!done) {
    verdict = { cls: 'is-loading', icon: <span className="cmp-spinner" />, title: t.cmpLoading, sub: t.cmpLooking(zoneStores.length) };
  } else if (rows.length < 2) {
    verdict = { cls: 'is-best', icon: <Icon.search width="20" height="20" />, title: t.cmpNoSimilar, sub: t.cmpNotFound };
  } else if (saving > 0.005) {
    verdict = { cls: 'is-save', icon: <Icon.trophy width="20" height="20" />, title: t.cmpSave(fmt(saving), UNIT_LABEL[product.unit], savingPct), sub: t.cmpWith(STORE_BY_KEY[best.store].name) };
  } else {
    verdict = { cls: 'is-best', icon: <Icon.trophy width="20" height="20" />, title: t.cmpBest, sub: t.cmpNobody(unitWord ?? t.units.ud) };
  }

  return (
    <>
      {head}
      <div className="pd-aside-body">
        <div className={`cmp-verdict ${verdict.cls}`} aria-live="polite">
          <span className="cmp-verdict-icon">{verdict.icon}</span>
          <div>
            <strong>{verdict.title}</strong>
            <span>{verdict.sub}</span>
          </div>
          {verdict.retry && <button type="button" className="cmp-chip" onClick={() => setAttempt((n) => n + 1)}>{t.retry}</button>}
        </div>

        <h3 className="cmp-sheet-sub">
          {done ? t.cmpCount(rows.length, title) : t.results}
          {unitWord && <span>{t.cmpSubtitle(unitWord)}</span>}
        </h3>

        <ol className="cmp-rank">
          {rows.map((r, i) => {
            const diff = r.ppu != null && best.ppu != null ? r.ppu - best.ppu : 0;
            const isBest = done && rows.length > 1 && r.ppu != null && diff < 0.0001;
            const selected = r.uid === product.uid;
            const Row = selected ? 'div' : 'a';
            return (
              <li key={r.uid} className={`cmp-rank-row${isBest ? ' is-best' : ''}${selected ? ' is-selected' : ' is-link'}`}>
                <Row className="cmp-rank-link" {...(selected ? {} : { href: productPath(r.store, r.id, t.lang) })}>
                  <span className="cmp-rank-pos">{i + 1}</span>
                  <div className="cmp-rank-thumb">
                    <ProductImage src={r.image} />
                    <span className="cmp-rank-logo"><StoreLogo store={r.store} size={22} /></span>
                  </div>
                  <div className="cmp-rank-info">
                    <div className="cmp-rank-top">
                      <span className="cmp-rank-store">{STORE_BY_KEY[r.store].name}</span>
                      {isBest && <span className="cmp-badge cmp-badge-best">{t.cmpCheapest}</span>}
                      {selected && !isBest && <span className="cmp-badge cmp-badge-mine">{t.cmpYours}</span>}
                      {exactUids.has(r.uid) && <span className="cmp-badge cmp-badge-mine">{t.pdSameBadge}</span>}
                    </div>
                    <span className="cmp-rank-name">{r.label}{r.format ? ` · ${r.format}` : ''}</span>
                    {r.ppu != null && (
                      <span className="cmp-rank-bar" aria-hidden="true">
                        <span style={{ width: `${Math.max(14, (r.ppu / max) * 100)}%` }} />
                      </span>
                    )}
                  </div>
                  <div className="cmp-rank-price">
                    <strong>{fmt(r.price)}</strong>
                    {ppuText(r) && <span>{ppuText(r)}</span>}
                    {diff > 0.005 && <em>+{fmt(diff)}</em>}
                  </div>
                </Row>
              </li>
            );
          })}
          {status === 'loading' && Array.from({ length: 3 }, (_, i) => (
            <li key={`s${i}`} className="cmp-rank-row cmp-skel" aria-hidden="true">
              <span className="cmp-skel-block" style={{ width: 52, height: 52, borderRadius: 12 }} />
              <div className="cmp-rank-info">
                <span className="cmp-skel-block" style={{ width: '35%', height: 12 }} />
                <span className="cmp-skel-block" style={{ width: '80%', height: 10, marginTop: 8 }} />
              </div>
              <span className="cmp-skel-block" style={{ width: 52, height: 18 }} />
            </li>
          ))}
        </ol>

        {missing.length > 0 && (
          <div className="cmp-missing">
            <span>{t.cmpMissing}</span>
            <div>{missing.map((s) => <StoreLogo key={s.key} store={s.key} size={22} />)}</div>
          </div>
        )}
        {failed.length > 0 && (
          <p className="cmp-note">{t.cmpCouldNotNow(failed.map((k) => STORE_BY_KEY[k].name).join(', '))}</p>
        )}

        <p className="cmp-note">{t.cmpNote}</p>
      </div>

      <footer className="pd-aside-foot">
        <a className="cmp-btn cmp-btn-primary" href={t.download}>
          {t.cmpList}
          <Icon.arrow width="18" height="18" />
        </a>
      </footer>
    </>
  );
}
