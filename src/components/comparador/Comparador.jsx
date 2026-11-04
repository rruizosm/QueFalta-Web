import { useEffect, useMemo, useRef, useState } from 'react';
import { STORES, STORE_BY_KEY, regionFromPostalCode, storesForPostalCode } from '../../data/comparadorZonas.js';
import { apiConfigured, findSimilar, keyWords, norm, searchAllStores } from '../../lib/comparadorApi.js';
import { Icon, ProductCard, ProductImage, SkeletonCard, StoreLogo, UNIT_LABEL, fmt, ppuText } from './ui.jsx';
import StoreBrowser from './StoreBrowser.jsx';
import { LangProvider, useT } from './i18n.jsx';

// Comparador de precios entre supermercados (isla React de / y /ca/comparador/).
// Busca en los catálogos reales de Supabase (comparadorApi.js) solo en los
// súper del código postal del usuario. La portada se ve sin CP (un aviso que
// tape la página perjudica en Google): se pide al buscar o elegir súper, y se
// recuerda en este navegador (`qf-cp`).

const CP_KEY = 'qf-cp';

// La vista de súper vive en la URL (?super=…&cat=…): atrás del navegador y
// enlaces compartidos funcionan.
function readRoute() {
  const q = new URLSearchParams(window.location.search);
  return { store: q.get('super'), cat: q.get('cat') };
}

function readCp() {
  try {
    const v = localStorage.getItem(CP_KEY);
    return v && regionFromPostalCode(v) ? v : null;
  } catch {
    return null;
  }
}

function saveCp(cp) {
  try { localStorage.setItem(CP_KEY, cp); } catch {}
}

/* ───────────────────── Modal de código postal ───────────────────── */

function PostalModal({ initial, canClose, onSave, onClose }) {
  const t = useT();
  const [cp, setCp] = useState(initial ?? '');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!canClose) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [canClose, onClose]);

  const complete = cp.length === 5;
  const region = complete ? regionFromPostalCode(cp) : null;
  const stores = region ? storesForPostalCode(cp) : [];
  const invalid = complete && !region;

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (region) onSave(cp);
  };

  return (
    <div className="cmp-modal-root" role="presentation">
      <div className="cmp-modal-backdrop" onClick={canClose ? onClose : undefined} />
      <form className="cmp-modal" role="dialog" aria-modal="true" aria-labelledby="cmp-cp-title" onSubmit={submit}>
        {canClose && (
          <button type="button" className="cmp-modal-x" onClick={onClose} aria-label={t.close}>
            <Icon.close width="18" height="18" />
          </button>
        )}
        <div className="cmp-modal-pin" aria-hidden="true">
          <span className="cmp-modal-pin-pulse" />
          <Icon.pin width="28" height="28" />
        </div>
        <h2 id="cmp-cp-title" className="cmp-modal-title">{t.cpTitle}</h2>
        <p className="cmp-modal-lead">{t.cpLead}</p>

        <label className={`cmp-otp${invalid && touched ? ' is-error' : ''}${region ? ' is-ok' : ''}`}>
          <span className="cmp-sr">{t.cpLabel}</span>
          <input
            ref={inputRef}
            className="cmp-otp-input"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={cp}
            onChange={(e) => { setCp(e.target.value.replace(/\D/g, '').slice(0, 5)); setTouched(e.target.value.length >= 5); }}
            aria-invalid={invalid}
            aria-describedby="cmp-cp-status"
          />
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`cmp-otp-box${cp[i] ? ' is-filled' : ''}${i === cp.length || (i === 4 && complete) ? ' is-caret' : ''}`}
            >
              {cp[i] ?? ''}
            </span>
          ))}
        </label>

        <div id="cmp-cp-status" className="cmp-modal-status" aria-live="polite">
          {region ? (
            <div className="cmp-zone" key={cp}>
              <div className="cmp-zone-head">
                <span className="cmp-zone-dot" />
                <strong>{t.region(region)}</strong>
                <span className="cmp-zone-count">{t.stores(stores.length)}</span>
              </div>
              <div className="cmp-zone-logos">
                {stores.map((s, i) => (
                  <span key={s.key} className="cmp-zone-logo" style={{ animationDelay: `${i * 35}ms` }} title={s.name}>
                    <img src={s.logo} alt={s.name} width="30" height="30" />
                  </span>
                ))}
              </div>
            </div>
          ) : invalid ? (
            <p className="cmp-modal-error">{t.cpInvalid}</p>
          ) : (
            <p className="cmp-modal-hint">{t.cpHint}</p>
          )}
        </div>

        <button type="submit" className="cmp-btn cmp-btn-primary cmp-modal-cta" disabled={!region}>
          {t.cpCta}
          <Icon.arrow width="18" height="18" />
        </button>
        <p className="cmp-modal-privacy">
          <Icon.lock width="13" height="13" />
          {t.cpPrivacy}
        </p>
      </form>
    </div>
  );
}

/* ───────────────────── Panel de comparación ───────────────────── */

function ComparePanel({ product, cp, zoneStores, onClose }) {
  const t = useT();
  const panelRef = useRef(null);
  const [state, setState] = useState({ status: 'loading', rows: [product], failed: [], keys: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading', rows: [product], failed: [], keys: [] });
    findSimilar(product, { cp, stores: zoneStores.map((s) => s.key), signal: ctrl.signal, lang: t.lang })
      .then((res) => { if (res) setState({ status: 'done', ...res }); })
      .catch(() => { if (!ctrl.signal.aborted) setState((s) => ({ ...s, status: 'error' })); });
    return () => ctrl.abort();
  }, [product, cp, zoneStores, attempt, t.lang]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { rows, status, failed, keys } = state;
  const done = status === 'done';
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
    <div className="cmp-sheet-root">
      <div className="cmp-sheet-backdrop" onClick={onClose} />
      <aside ref={panelRef} tabIndex={-1} className="cmp-sheet" role="dialog" aria-modal="true" aria-labelledby="cmp-sheet-title">
        <header className="cmp-sheet-head">
          <span className="cmp-sheet-grip" aria-hidden="true" />
          <div className="cmp-sheet-hero">
            <div className="cmp-sheet-img"><ProductImage src={product.image} /></div>
            <div className="cmp-sheet-meta">
              <span className="cmp-eyebrow">{t.cmpEyebrow}</span>
              <h2 id="cmp-sheet-title">{product.label}</h2>
              <p>
                {STORE_BY_KEY[product.store].name} · <strong>{fmt(product.price)}</strong>
                {ppuText(product) && <> · {ppuText(product)}</>}
              </p>
            </div>
          </div>
          <button type="button" className="cmp-sheet-x" onClick={onClose} aria-label={t.cmpClose}>
            <Icon.close width="18" height="18" />
          </button>
        </header>

        <div className="cmp-sheet-scroll">
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
              return (
                <li key={r.uid} className={`cmp-rank-row${isBest ? ' is-best' : ''}${selected ? ' is-selected' : ''}`}>
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

        <footer className="cmp-sheet-foot">
          <a className="cmp-btn cmp-btn-primary" href={t.download}>
            {t.cmpList}
            <Icon.arrow width="18" height="18" />
          </a>
        </footer>
      </aside>
    </div>
  );
}

/* ───────────────────────────── Página ───────────────────────────── */

const PAGE = 24;

function ComparadorPage() {
  const t = useT();
  const [ready, setReady] = useState(false);
  const [cp, setCp] = useState(null);
  const [editingCp, setEditingCp] = useState(false);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [searchId, setSearchId] = useState(0);
  const [focused, setFocused] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [storeFilter, setStoreFilter] = useState(null); // null = todos los de la zona
  const [compare, setCompare] = useState(null);
  const [byStore, setByStore] = useState({}); // súper → productos
  const [pending, setPending] = useState([]); // súper que aún no han respondido
  const [failed, setFailed] = useState([]);
  const [visible, setVisible] = useState(PAGE);
  const [scrollTick, setScrollTick] = useState(0);
  const [route, setRoute] = useState({ store: null, cat: null });
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    setCp(readCp());
    setRoute(readRoute());
    setReady(true);
    // Las páginas /precios/ enlazan aquí con la búsqueda ya hecha (?q=…).
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial?.trim().length >= 2) {
      setQuery(initial);
      setSubmitted(initial.trim());
      if (readCp()) setScrollTick(1);
    }
    const onPop = () => setRoute(readRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (store, cat = null) => {
    const q = new URLSearchParams();
    if (store) q.set('super', store);
    if (cat) q.set('cat', cat);
    const search = q.toString();
    window.history.pushState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
    setRoute({ store, cat });
  };

  // Sin CP no se puede cumplir lo pedido (buscar, abrir un súper): se pide aquí.
  const needsCp = ready && !cp && (!!route.store || !!submitted);
  const showModal = ready && (editingCp || needsCp);
  const region = cp ? regionFromPostalCode(cp) : null;
  const zoneStores = useMemo(() => (cp ? storesForPostalCode(cp) : []), [cp]);
  const zoneKeys = useMemo(() => new Set(zoneStores.map((s) => s.key)), [zoneStores]);
  const activeKeys = storeFilter ?? zoneKeys;
  // Un súper de la URL que no opera en esta zona no se abre.
  const storeKey = route.store && zoneKeys.has(route.store) ? route.store : null;
  const outOfZone = cp && route.store && !storeKey ? STORE_BY_KEY[route.store]?.name : null;

  // Bloquea el scroll del fondo con un modal o el panel abiertos.
  useEffect(() => {
    const lock = showModal || !!compare;
    document.documentElement.classList.toggle('cmp-locked', lock);
    return () => document.documentElement.classList.remove('cmp-locked');
  }, [showModal, compare]);

  // Búsqueda real: un RPC por súper de la zona, pintando según responden.
  useEffect(() => {
    const q = submitted.trim();
    if (!q || !cp || !apiConfigured) return undefined;
    const ctrl = new AbortController();
    const stores = zoneStores.map((s) => s.key);
    setByStore({});
    setFailed([]);
    setPending(stores);
    setVisible(PAGE);
    searchAllStores({
      query: q, cp, stores, limit: 12, signal: ctrl.signal, lang: t.lang,
      onStore: (store, products) => {
        if (products) setByStore((prev) => ({ ...prev, [store]: products }));
        else setFailed((prev) => [...prev, store]);
        setPending((prev) => prev.filter((s) => s !== store));
      },
    });
    return () => ctrl.abort();
  }, [submitted, searchId, cp, zoneStores, t.lang]);

  const suggestions = useMemo(() => {
    const q = norm(query.trim());
    if (q.length < 2) return [];
    return t.suggestions.filter((l) => norm(l).includes(q) && norm(l) !== q).slice(0, 6);
  }, [query, t]);

  const results = useMemo(() => {
    const list = Object.entries(byStore)
      .filter(([store]) => activeKeys.has(store))
      .flatMap(([, products]) => products);
    const byPpu = (a, b) => (a.ppu ?? Infinity) - (b.ppu ?? Infinity) || a.price - b.price;
    const sorters = {
      // Relevancia: intercala súper por su posición en el ranking (1º de cada uno, 2º…).
      relevance: (a, b) => a.rank - b.rank || byPpu(a, b),
      ppu: byPpu,
      price: (a, b) => a.price - b.price,
      store: (a, b) => STORE_BY_KEY[a.store].name.localeCompare(STORE_BY_KEY[b.store].name) || a.rank - b.rank,
    };
    return list.sort(sorters[sort]);
  }, [byStore, activeKeys, sort]);

  // Mejor precio por unidad de medida entre los resultados (kg, l y ud por separado).
  const bestPpu = useMemo(() => {
    const m = {};
    for (const p of results) if (p.ppu != null && (m[p.unit] == null || p.ppu < m[p.unit])) m[p.unit] = p.ppu;
    return m;
  }, [results]);

  // El texto para buscadores (fuera de la isla) solo acompaña a la portada.
  const showingHome = !storeKey && !submitted;
  useEffect(() => {
    document.documentElement.classList.toggle('cmp-in-view', !showingHome);
  }, [showingHome]);

  const loading = pending.length > 0;
  const answered = zoneStores.length - pending.length;

  const runSearch = (text) => {
    const t = text.trim();
    if (t.length < 2) return;
    setQuery(text);
    setSubmitted(t);
    setSearchId((n) => n + 1);
    setStoreFilter(null);
    setFocused(false);
    searchRef.current?.blur();
    if (cp) setScrollTick((n) => n + 1);
  };

  // Tras pintar los resultados, baja hasta ellos (no antes: el alto cambia).
  useEffect(() => {
    if (scrollTick) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [scrollTick]);

  const toggleStore = (key) => {
    const next = new Set(storeFilter ?? []);
    if (next.has(key)) next.delete(key); else next.add(key);
    setStoreFilter(next.size === 0 ? null : next);
    setVisible(PAGE);
  };

  const saveZone = (value) => {
    saveCp(value);
    setCp(value);
    setStoreFilter(null);
    setEditingCp(false);
    if (submitted) setScrollTick((n) => n + 1);
    else setTimeout(() => searchRef.current?.focus(), 60);
  };

  // Cerrar sin CP cancela lo que lo pedía y deja la portada, sin nada en la URL.
  const closeZone = () => {
    setEditingCp(false);
    if (cp) return;
    setSubmitted('');
    setRoute({ store: null, cat: null });
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
  };

  return (
    <div className="cmp">
      {storeKey ? (
        <StoreBrowser
          key={storeKey}
          storeKey={storeKey}
          categoryId={route.cat}
          cp={cp}
          onBack={() => { navigate(null); window.scrollTo({ top: 0 }); }}
          onCategory={(cat) => navigate(storeKey, cat)}
          onEditZone={() => setEditingCp(true)}
          onCompare={setCompare}
        />
      ) : (
      <>
      {/* ───────── Hero + buscador ───────── */}
      <section className="cmp-hero">
        <div className="cmp-hero-bg" aria-hidden="true">
          <span className="cmp-orb cmp-orb-1" />
          <span className="cmp-orb cmp-orb-2" />
          <span className="cmp-grid" />
        </div>
        <div className="cmp-hero-inner">
          <button type="button" className={`cmp-zone-chip${cp ? '' : ' is-empty'}`} onClick={() => setEditingCp(true)}>
            <Icon.pin width="15" height="15" />
            {cp ? (
              <>
                <strong>{cp}</strong>
                <span className="cmp-zone-chip-sep" />
                {t.region(region)}
                <span className="cmp-zone-chip-sep" />
                {t.stores(zoneStores.length)}
                <span className="cmp-zone-chip-edit">{t.change}</span>
              </>
            ) : (
              t.chooseZone
            )}
          </button>

          <h1 className="cmp-kicker">{t.kicker}</h1>
          <p className="cmp-title">
            {t.titleA}<br />
            <span>{t.titleB}</span>{t.titleC}
          </p>
          <p className="cmp-lead">{t.lead}</p>

          <form className={`cmp-search${focused ? ' is-focused' : ''}`} role="search" onSubmit={(e) => { e.preventDefault(); runSearch(query); }}>
            <Icon.search width="22" height="22" className="cmp-search-icon" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              autoComplete="off"
              enterKeyHint="search"
              maxLength={80}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
            />
            <button type="submit" className="cmp-btn cmp-btn-primary cmp-search-btn" disabled={query.trim().length < 2}>
              <span>{t.compare}</span>
              <Icon.arrow width="18" height="18" />
            </button>
            {focused && suggestions.length > 0 && (
              <ul className="cmp-suggest" role="listbox">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button type="button" role="option" aria-selected="false" onMouseDown={(e) => e.preventDefault()} onClick={() => runSearch(s)}>
                      <Icon.search width="15" height="15" />
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>

          <div className="cmp-popular">
            <span>{t.popular}</span>
            {t.popularItems.map((p) => (
              <button type="button" key={p} className="cmp-chip" onClick={() => runSearch(p)}>{p}</button>
            ))}
          </div>

          <div className="cmp-picker">
            <h2 className="cmp-picker-title"><span>{t.picker}</span></h2>
            {outOfZone && <p className="cmp-picker-note" role="status">{t.notInZone(outOfZone)}</p>}
            <div className="cmp-picks">
              {(cp ? zoneStores : STORES).map((s) => (
                <button
                  type="button"
                  key={s.key}
                  className="cmp-pick"
                  onClick={() => { navigate(s.key); if (cp) window.scrollTo({ top: 0 }); }}
                >
                  <span className="cmp-pick-logo"><img src={s.logo} alt="" width="52" height="52" /></span>
                  <span className="cmp-pick-name">{s.name}</span>
                  <Icon.arrow width="17" height="17" className="cmp-pick-go" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Resultados o portada ───────── */}
      <div ref={resultsRef} className="cmp-body">
        {submitted && cp && !apiConfigured ? (
          <div className="cmp-empty cmp-results">
            <h3>{t.unavailableTitle}</h3>
            <p>{t.unavailableText}</p>
          </div>
        ) : submitted && cp ? (
          <section className="cmp-results">
            <div className="cmp-results-head">
              <div>
                <span className="cmp-eyebrow">{loading ? t.searchingCount(answered, zoneStores.length) : t.results}</span>
                <h2 aria-live="polite">
                  {loading && results.length === 0
                    ? t.searching(submitted)
                    : t.resultsFor(results.length, submitted)}
                </h2>
              </div>
              <label className="cmp-sort">
                <span>{t.sort}</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="relevance">{t.sortRelevance}</option>
                  <option value="ppu">{t.sortPpu}</option>
                  <option value="price">{t.sortPrice}</option>
                  <option value="store">{t.sortStore}</option>
                </select>
              </label>
            </div>
            <div className={`cmp-progress${loading ? '' : ' is-done'}`} aria-hidden="true">
              <span style={{ width: `${(answered / Math.max(1, zoneStores.length)) * 100}%` }} />
            </div>

            <div className="cmp-filter" role="group" aria-label={t.filterLabel}>
              <button type="button" className={`cmp-filter-all${storeFilter ? '' : ' is-on'}`} onClick={() => { setStoreFilter(null); setVisible(PAGE); }}>
                {t.filterAll}
              </button>
              {zoneStores.map((s) => {
                const n = byStore[s.key]?.length ?? 0;
                const isPending = pending.includes(s.key);
                const empty = !isPending && n === 0;
                return (
                  <button
                    type="button"
                    key={s.key}
                    className={`cmp-filter-store${storeFilter?.has(s.key) ? ' is-on' : ''}${empty ? ' is-empty' : ''}`}
                    aria-pressed={!!storeFilter?.has(s.key)}
                    onClick={() => toggleStore(s.key)}
                    disabled={empty}
                    title={s.name}
                  >
                    <img src={s.logo} alt="" width="22" height="22" />
                    <span>{s.name}</span>
                    <em>{isPending ? <span className="cmp-dot-pulse" /> : n}</em>
                  </button>
                );
              })}
            </div>

            {results.length > 0 ? (
              <>
                <div className="cmp-grid-cards">
                  {results.slice(0, visible).map((p, i) => (
                    <ProductCard
                      key={p.uid}
                      index={i}
                      product={p}
                      isBest={p.ppu != null && results.length > 1 && p.ppu <= bestPpu[p.unit] + 0.0001}
                      onCompare={() => setCompare(p)}
                    />
                  ))}
                  {loading && results.length < 8 && Array.from({ length: 4 }, (_, i) => <SkeletonCard key={`sk${i}`} />)}
                </div>
                {results.length > visible && (
                  <div className="cmp-more">
                    <button type="button" className="cmp-chip" onClick={() => setVisible((v) => v + PAGE)}>
                      {t.moreProducts} ({results.length - visible})
                    </button>
                  </div>
                )}
              </>
            ) : loading ? (
              <div className="cmp-grid-cards">{Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}</div>
            ) : (
              <div className="cmp-empty">
                <span className="cmp-empty-icon"><Icon.search width="28" height="28" /></span>
                <h3>{failed.length === zoneStores.length ? t.searchFailed : t.notFound(submitted)}</h3>
                <p>{failed.length === zoneStores.length ? t.checkConnection : t.notFoundHint}</p>
                <div className="cmp-popular cmp-popular-center">
                  {failed.length === zoneStores.length
                    ? <button type="button" className="cmp-chip" onClick={() => runSearch(submitted)}>{t.retry}</button>
                    : t.popularItems.map((p) => <button type="button" key={p} className="cmp-chip" onClick={() => runSearch(p)}>{p}</button>)}
                </div>
              </div>
            )}
            {!loading && failed.length > 0 && failed.length < zoneStores.length && (
              <p className="cmp-note cmp-note-center">{t.couldNot(failed.map((k) => STORE_BY_KEY[k].name).join(', '))}</p>
            )}
          </section>
        ) : (
          <>
            <section className="cmp-section">
              <div className="cmp-section-head">
                <span className="cmp-eyebrow">{t.exploreEyebrow}</span>
                <h2>{t.exploreTitle}</h2>
              </div>
              <div className="cmp-cats">
                {t.categories.map((c) => (
                  <button type="button" key={c.label} className="cmp-cat" onClick={() => runSearch(c.query)}>
                    <span className="cmp-cat-emoji" aria-hidden="true">{c.emoji}</span>
                    <span className="cmp-cat-label">{c.label}</span>
                    <Icon.arrow width="16" height="16" className="cmp-cat-go" />
                  </button>
                ))}
              </div>
            </section>

            <section className="cmp-section">
              <div className="cmp-section-head">
                <span className="cmp-eyebrow">{t.howEyebrow}</span>
                <h2>{t.howTitle}</h2>
              </div>
              <ol className="cmp-steps">
                {t.steps.map(([head, text], i) => (
                  <li key={head}>
                    <span className="cmp-step-n">{i + 1}</span>
                    <h3>{head}</h3>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}

        <p className="cmp-disclaimer">{t.disclaimer}</p>
      </div>
      </>
      )}

      {showModal && (
        <PostalModal
          initial={cp}
          canClose
          onSave={saveZone}
          onClose={closeZone}
        />
      )}
      {compare && <ComparePanel product={compare} cp={cp} zoneStores={zoneStores} onClose={() => setCompare(null)} />}
    </div>
  );
}

export default function Comparador({ lang = 'es' }) {
  return <LangProvider lang={lang}><ComparadorPage /></LangProvider>;
}
