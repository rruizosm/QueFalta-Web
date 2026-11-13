import { useEffect, useMemo, useState } from 'react';
import { STORE_BY_KEY, regionFromPostalCode } from '../../data/comparadorZonas.js';
import { categoryIds, countDrops, countOffers, fetchBannerImages, fetchCategoryTree, fetchStoreProducts, lidlStoreFor, searchStore } from '../../lib/comparadorApi.js';
import { CATALOG_OFFERS, offersPagePath } from '../../lib/ofertas.js';
import { dropsPagePath, hasDrops } from '../../lib/bajadas.js';
import { Icon, ProductCard, SkeletonCard, StoreLogo } from './ui.jsx';
import { useT } from './i18n.jsx';

// Vista de un supermercado: navegador de categorías a la izquierda y sus
// productos a la derecha. La categoría va en la URL (la gestiona Comparador,
// o StoreCatalog en /supermercados/). Sin `cp` todavía (la página aún no ha
// leído el CP guardado) solo pinta el esqueleto.

const PAGE = 48;

const Chevron = ({ open }) => (
  <svg className={`cmp-side-chev${open ? ' is-open' : ''}`} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
);

function findNode(tree, id) {
  for (const root of tree) {
    if (root.id === id) return { node: root, root };
    const child = root.children.find((c) => c.id === id);
    if (child) return { node: child, root };
  }
  return null;
}

function CategoryNav({ tree, status, selected, expanded, onToggle, onSelect, onRetry, storeName }) {
  const t = useT();
  if (status === 'error') {
    return (
      <div className="cmp-side-state">
        <p>{t.catError}</p>
        <button type="button" className="cmp-chip" onClick={onRetry}>{t.retry}</button>
      </div>
    );
  }
  if (status === 'loading') {
    return (
      <div className="cmp-side-state" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => <span key={i} className="cmp-skel-block" style={{ height: 16, width: `${60 + ((i * 13) % 35)}%` }} />)}
      </div>
    );
  }
  return (
    <nav aria-label={t.catNav(storeName)}>
      <button type="button" className={`cmp-side-all${selected ? '' : ' is-on'}`} aria-current={selected ? undefined : 'true'} onClick={() => onSelect(null)}>
        {t.allProducts}
      </button>
      <ul className="cmp-side-list">
        {tree.map((root) => {
          const open = expanded === root.id;
          const hasChildren = root.children.length > 0;
          return (
            <li key={root.id}>
              <button
                type="button"
                className={`cmp-side-root${selected === root.id ? ' is-on' : ''}`}
                aria-expanded={hasChildren ? open : undefined}
                aria-current={selected === root.id ? 'true' : undefined}
                onClick={() => { onToggle(open ? null : root.id); if (!open) onSelect(root.id, hasChildren); }}
              >
                <span>{root.name}</span>
                {hasChildren && <Chevron open={open} />}
              </button>
              {open && hasChildren && (
                <ul className="cmp-side-sub">
                  {root.children.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={selected === c.id ? 'is-on' : ''}
                        aria-current={selected === c.id ? 'true' : undefined}
                        onClick={() => onSelect(c.id)}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Estrella de 18 puntas (sello «2.393 productos») en un viewBox 0 0 100 100.
const BURST = Array.from({ length: 36 }, (_, i) => {
  const r = i % 2 ? 40 : 50;
  const a = (Math.PI * i) / 18 - Math.PI / 2;
  return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

/** Banner de ofertas de la semana (rotulado tipo folleto): activa el filtro y,
 *  si la cadena la tiene, enlaza a su página /ofertas/. Las fotos son
 *  decorativas (fetchBannerImages). */
function OffersBanner({ storeKey, cp, count, active, onToggle }) {
  const t = useT();
  const [images, setImages] = useState([]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchBannerImages(storeKey, ctrl.signal, cp).then(setImages).catch(() => {});
    return () => ctrl.abort();
  }, [storeKey, cp]);

  if (!count) return null;
  return (
    <section className={`cmp-promo${active ? ' is-on' : ''}`} aria-label={t.promoAria(count)}>
      <span className="cmp-promo-rays" aria-hidden="true" />
      <span className="cmp-promo-dots" aria-hidden="true" />

      <div className="cmp-promo-copy">
        <span className="cmp-promo-ribbon">{t.promoRibbon}</span>
        <p className="cmp-promo-title">
          <span className="cmp-promo-big">{t.promoBig}</span>
          <span className="cmp-promo-small">{t.promoSmall}</span>
        </p>
        <div className="cmp-promo-actions">
          {/* Cada cadena con ofertas tiene su página /ofertas/<slug>/ (OFFER_PAGES). */}
          {offersPagePath(storeKey, t.lang) ? (
            <a className="cmp-promo-btn" href={offersPagePath(storeKey, t.lang)}>{t.offersOnly} →</a>
          ) : (
            <button type="button" className="cmp-promo-btn" onClick={onToggle} aria-pressed={active}>
              {active ? t.offersAll : t.offersOnly}
            </button>
          )}
        </div>
      </div>

      <div className="cmp-promo-art" aria-hidden="true">
        <span className="cmp-promo-burst">
          <svg viewBox="0 0 100 100"><polygon points={BURST} /></svg>
          <span>
            <strong>{count.toLocaleString(t.lang === 'ca' ? 'ca-ES' : 'de-DE')}</strong>
            <em>{t.promoBurst}</em>
          </span>
        </span>
        {images.map((src, i) => (
          <span key={src} className={`cmp-promo-sticker is-${i + 1}`}>
            <img src={src} alt="" loading="lazy" decoding="async" />
          </span>
        ))}
      </div>
    </section>
  );
}

/** Banner verde «Bajadas de precio» (encima de las categorías): lleva a la
 *  página /supermercados/<slug>/bajadas/ con los productos que han bajado esta semana. */
function DropsBanner({ storeKey, count, className = '' }) {
  const t = useT();
  if (!count) return null;
  return (
    <a className={`cmp-drops ${className}`} href={dropsPagePath(storeKey, t.lang)}>
      <span className="cmp-drops-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l6 6 4-4 8 8" /><path d="M21 11v6h-6" /></svg>
      </span>
      <span className="cmp-drops-copy">
        <span className="cmp-drops-title">{t.dropsTitle}</span>
        <span className="cmp-drops-sub">{t.dropsSub(count)}</span>
      </span>
      <Icon.arrow width="18" height="18" className="cmp-drops-go" />
    </a>
  );
}

export default function StoreBrowser({ storeKey, heading, categoryId, offersOnly = false, cp, referenceZone = false, onBack, onCategory, onEditZone }) {
  const t = useT();
  const store = STORE_BY_KEY[storeKey];
  const [tree, setTree] = useState([]);
  const [treeStatus, setTreeStatus] = useState('loading');
  const [treeAttempt, setTreeAttempt] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [order, setOrder] = useState('name');
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [lidlLabel, setLidlLabel] = useState(null);
  const [offerCount, setOfferCount] = useState(null);
  const [dropCount, setDropCount] = useState(null);

  useEffect(() => {
    setDropCount(null);
    if (!hasDrops(storeKey) || !cp) return undefined;
    const ctrl = new AbortController();
    countDrops(storeKey, cp, ctrl.signal).then(setDropCount).catch(() => {});
    return () => ctrl.abort();
  }, [storeKey, cp]);
  const hasOffers = !!CATALOG_OFFERS[storeKey];
  const showOffers = hasOffers && offersOnly;

  useEffect(() => {
    setOfferCount(null);
    if (!hasOffers || !cp) return undefined;
    const ctrl = new AbortController();
    countOffers(storeKey, cp, ctrl.signal).then(setOfferCount).catch(() => {});
    return () => ctrl.abort();
  }, [storeKey, hasOffers, cp]);

  useEffect(() => {
    if (!cp) return undefined;
    const ctrl = new AbortController();
    setTreeStatus('loading');
    fetchCategoryTree(storeKey, cp, ctrl.signal, t.lang)
      .then((t) => { setTree(t); setTreeStatus('done'); })
      .catch(() => { if (!ctrl.signal.aborted) { setTree([]); setTreeStatus('error'); } });
    return () => ctrl.abort();
  }, [storeKey, cp, treeAttempt, t.lang]);

  useEffect(() => {
    setLidlLabel(null);
    if (storeKey === 'lidl' && cp) lidlStoreFor(cp).then((s) => setLidlLabel(s?.label?.replace(/,+\s*/g, ', ') ?? null));
  }, [storeKey, cp]);

  const found = useMemo(() => (categoryId ? findNode(tree, categoryId) : null), [tree, categoryId]);
  const ids = useMemo(() => (found ? categoryIds(found.node) : null), [found]);

  // La rama de la categoría abierta por URL o por el usuario queda desplegada.
  useEffect(() => { if (found) setExpanded(found.root.id); }, [found]);

  // Productos: al entrar, cambiar de categoría u orden, o buscar dentro del súper.
  useEffect(() => {
    if (!cp || treeStatus === 'loading') return undefined;
    const ctrl = new AbortController();
    setStatus('loading');
    setItems([]);
    setTotal(null);
    setHasMore(false);
    const load = searched
      ? searchStore(storeKey, searched, cp, { limit: PAGE, signal: ctrl.signal, lang: t.lang }).then((products) => ({ products, rowCount: 0, total: products.length }))
      : fetchStoreProducts({ store: storeKey, cp, ids, order, limit: PAGE, signal: ctrl.signal, lang: t.lang, offersOnly: showOffers });
    load
      .then((res) => {
        setItems(res.products);
        setTotal(res.total);
        setHasMore(res.rowCount === PAGE);
        setStatus('done');
      })
      .catch(() => { if (!ctrl.signal.aborted) setStatus('error'); });
    return () => ctrl.abort();
  }, [storeKey, cp, ids, order, searched, treeStatus, attempt, t.lang, showOffers]);

  const loadMore = () => {
    setLoadingMore(true);
    fetchStoreProducts({ store: storeKey, cp, ids, order, offset: items.length, limit: PAGE, lang: t.lang, offersOnly: showOffers })
      .then((res) => {
        setItems((prev) => {
          const seen = new Set(prev.map((p) => p.uid));
          return [...prev, ...res.products.filter((p) => !seen.has(p.uid))];
        });
        setHasMore(res.rowCount === PAGE);
      })
      .catch(() => setStatus('error'))
      .finally(() => setLoadingMore(false));
  };

  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setDrawer(false); };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('cmp-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('cmp-locked');
    };
  }, [drawer]);

  // En el cajón móvil, una categoría con subcategorías lo deja abierto para elegir.
  const select = (id, keepDrawer = false) => {
    if (!keepDrawer) setDrawer(false);
    setSearched('');
    setQuery('');
    onCategory(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    setSearched(q.length >= 2 ? q : '');
  };

  const toggleOffers = () => {
    setSearched('');
    setQuery('');
    onCategory(categoryId, !showOffers);
  };

  const baseTitle = found?.node.name ?? t.allProducts;
  const title = searched ? t.resultsForShort(searched) : showOffers ? t.offersIn(found ? baseTitle : null) : baseTitle;
  const nav = (
    <CategoryNav
      tree={tree}
      status={treeStatus}
      selected={found?.node.id ?? null}
      expanded={expanded}
      onToggle={setExpanded}
      onSelect={select}
      onRetry={() => setTreeAttempt((n) => n + 1)}
      storeName={store.name}
    />
  );

  return (
    <div className="cmp-store">
      <header className="cmp-store-head">
        <div className="cmp-store-head-inner">
          <button type="button" className="cmp-store-back" onClick={onBack}>
            <Icon.arrow width="16" height="16" />
            {t.allStores}
          </button>
          <div className="cmp-store-title">
            <StoreLogo store={storeKey} size={64} />
            <div>
              <h1>{heading ?? store.name}</h1>
              <p>
                {cp && (referenceZone ? t.refPrices(t.region(regionFromPostalCode(cp))) : t.pricesFor(cp, t.region(regionFromPostalCode(cp))))}
                {cp && <button type="button" onClick={onEditZone}>{referenceZone ? t.setCp : t.change}</button>}
              </p>
              {lidlLabel && <p className="cmp-store-sub">{t.refStore(lidlLabel)}</p>}
            </div>
          </div>
          <form className="cmp-store-search" role="search" onSubmit={submitSearch}>
            <Icon.search width="18" height="18" />
            <input
              type="search"
              value={query}
              maxLength={80}
              placeholder={t.searchIn(store.name)}
              aria-label={t.searchIn(store.name)}
              enterKeyHint="search"
              onChange={(e) => { setQuery(e.target.value); if (!e.target.value) setSearched(''); }}
            />
          </form>
        </div>
      </header>

      <div className="cmp-store-layout">
        <aside className="cmp-side">
          <DropsBanner storeKey={storeKey} count={dropCount} />
          {nav}
        </aside>

        <section className="cmp-store-main">
          {/* En móvil el lateral no se ve: el banner va encima del botón de categorías. */}
          <DropsBanner storeKey={storeKey} count={dropCount} className="is-mobile" />
          <button type="button" className="cmp-side-open" onClick={() => setDrawer(true)}>
            <Icon.list width="18" height="18" />
            <span>{t.categoriesLabel}</span>
            <em>{found?.node.name ?? t.allProducts}</em>
          </button>

          {!searched && (
            <OffersBanner storeKey={storeKey} cp={cp} count={offerCount} active={showOffers} onToggle={toggleOffers} />
          )}

          <div className="cmp-results-head">
            <div>
              {found && !searched && <span className="cmp-eyebrow">{found.root.id === found.node.id ? store.name : found.root.name}</span>}
              <h2 aria-live="polite">{title}</h2>
              {total != null && status === 'done' && <p className="cmp-store-count">{t.products(total)}</p>}
            </div>
            {!searched && (
              <label className="cmp-sort">
                <span>{t.sort}</span>
                <select value={order} onChange={(e) => setOrder(e.target.value)}>
                  <option value="name">{t.sortName}</option>
                  <option value="price">{t.sortPrice}</option>
                  <option value="ppu">{t.sortPpu}</option>
                </select>
              </label>
            )}
          </div>

          {status === 'error' ? (
            <div className="cmp-empty">
              <h3>{t.productsError}</h3>
              <p>{t.checkConnection}</p>
              <div className="cmp-popular cmp-popular-center">
                <button type="button" className="cmp-chip" onClick={() => setAttempt((n) => n + 1)}>{t.retry}</button>
              </div>
            </div>
          ) : status === 'loading' ? (
            <div className="cmp-grid-cards">{Array.from({ length: 9 }, (_, i) => <SkeletonCard key={i} />)}</div>
          ) : items.length === 0 ? (
            <div className="cmp-empty">
              <span className="cmp-empty-icon"><Icon.search width="28" height="28" /></span>
              <h3>{searched ? t.noneOf(searched, store.name) : t.noneHere}</h3>
              <p>{searched ? t.otherWord : t.otherCategory}</p>
            </div>
          ) : (
            <>
              <div className="cmp-grid-cards">
                {items.map((p, i) => (
                  <ProductCard key={p.uid} index={i % PAGE} product={p} isBest={false} />
                ))}
              </div>
              {hasMore && (
                <div className="cmp-more">
                  <button type="button" className="cmp-chip" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? t.loading : t.moreProducts}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {drawer && (
        <div className="cmp-drawer-root">
          <div className="cmp-sheet-backdrop" onClick={() => setDrawer(false)} />
          <aside className="cmp-drawer" role="dialog" aria-modal="true" aria-label={t.categoriesLabel}>
            <div className="cmp-drawer-head">
              <strong>{t.categoriesLabel}</strong>
              <button type="button" className="cmp-sheet-x" onClick={() => setDrawer(false)} aria-label={t.closeCategories}>
                <Icon.close width="18" height="18" />
              </button>
            </div>
            <div className="cmp-drawer-scroll">{nav}</div>
          </aside>
        </div>
      )}
    </div>
  );
}
