import { useEffect, useMemo, useRef, useState } from 'react';
import { STORES, STORE_BY_KEY, regionFromPostalCode, storesForPostalCode } from '../../data/comparadorZonas.js';
import { apiConfigured, norm, searchAllStores } from '../../lib/comparadorApi.js';
import { Icon, ProductCard, SkeletonCard } from './ui.jsx';
import StoreBrowser from './StoreBrowser.jsx';
import PostalModal, { readCp, saveCp } from './PostalModal.jsx';
import { LangProvider, useT } from './i18n.jsx';

// Comparador de precios entre supermercados (isla React de / y /ca/comparador/).
// Busca en los catálogos reales de Supabase (comparadorApi.js) solo en los
// súper del código postal del usuario. La portada se ve sin CP (un aviso que
// tape la página perjudica en Google): se pide al buscar o elegir súper, y se
// recuerda en este navegador (`qf-cp`).

// La vista de súper (?super=…&cat=…) y la búsqueda (?q=…) viven en la URL:
// atrás del navegador (también al volver de una ficha de producto) y los
// enlaces compartidos funcionan.
function readRoute() {
  const q = new URLSearchParams(window.location.search);
  return { store: q.get('super'), cat: q.get('cat'), q: q.get('q') };
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
    const onPop = () => {
      const next = readRoute();
      setRoute(next);
      const q = next.q?.trim() ?? '';
      if (!next.store) {
        setQuery(next.q ?? '');
        setSubmitted(q.length >= 2 ? q : '');
      }
    };
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

  // Bloquea el scroll del fondo con el modal abierto.
  useEffect(() => {
    document.documentElement.classList.toggle('cmp-locked', showModal);
    return () => document.documentElement.classList.remove('cmp-locked');
  }, [showModal]);

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
    // En la URL, para volver a estos resultados desde una ficha.
    const url = `${window.location.pathname}?q=${encodeURIComponent(t)}`;
    if (new URLSearchParams(window.location.search).get('q') !== t) window.history.pushState(null, '', url);
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
    </div>
  );
}

export default function Comparador({ lang = 'es' }) {
  return <LangProvider lang={lang}><ComparadorPage /></LangProvider>;
}
