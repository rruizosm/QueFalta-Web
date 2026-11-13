import { useEffect, useMemo, useRef, useState } from 'react';
import { LangProvider } from '../comparador/i18n.jsx';
import { Icon, ProductCard, SkeletonCard } from '../comparador/ui.jsx';
import { KIND_LABEL, KIND_ORDER, byDiscount, unpackOffer } from '../../lib/ofertas.js';

// Ofertas de un súper en /ofertas/<slug>/: bloque de mayores rebajas y, debajo,
// el mismo diseño que la vista de súper del comparador (lateral + tarjetas),
// filtrando por categoría y por tipo de oferta. El HTML inicial (lo que lee
// Google) sale de las props; el resto se carga de datos.json y se filtra aquí.

const PAGE = 48;

const COPY = {
  es: {
    top: 'Las mayores rebajas',
    topSub: 'Los productos con más descuento sobre su precio anterior.',
    categories: 'Categorías',
    kinds: 'Tipo de oferta',
    allOffers: 'Todas las ofertas',
    allKinds: 'Todos los tipos',
    filters: 'Filtros',
    close: 'Cerrar filtros',
    offers: (n) => `${n.toLocaleString('es-ES')} ${n === 1 ? 'oferta' : 'ofertas'}`,
    sort: 'Ordenar',
    sortDiscount: 'Mayor descuento',
    sortPrice: 'Precio',
    sortName: 'Nombre',
    more: 'Ver más ofertas',
    none: 'No hay ofertas con estos filtros',
    noneText: 'Prueba con otra categoría o con otro tipo de oferta.',
    reset: 'Quitar filtros',
    scrollLeft: 'Anteriores',
    scrollRight: 'Siguientes',
  },
  ca: {
    top: 'Les rebaixes més grans',
    topSub: 'Els productes amb més descompte sobre el preu anterior.',
    categories: 'Categories',
    kinds: "Tipus d'oferta",
    allOffers: 'Totes les ofertes',
    allKinds: 'Tots els tipus',
    filters: 'Filtres',
    close: 'Tancar els filtres',
    offers: (n) => `${n.toLocaleString('ca-ES')} ${n === 1 ? 'oferta' : 'ofertes'}`,
    sort: 'Ordenar',
    sortDiscount: 'Més descompte',
    sortPrice: 'Preu',
    sortName: 'Nom',
    more: "Veure més ofertes",
    none: 'No hi ha ofertes amb aquests filtres',
    noneText: "Prova amb una altra categoria o amb un altre tipus d'oferta.",
    reset: 'Treure els filtres',
    scrollLeft: 'Anteriors',
    scrollRight: 'Següents',
  },
};

// Página de bajadas de precio (/supermercados/<slug>/bajadas/): mismos componentes, otros textos.
const DROP_COPY = {
  es: {
    top: 'Las mayores bajadas',
    topSub: 'Los productos que más han bajado de precio esta semana.',
    allOffers: 'Todas las bajadas',
    offers: (n) => `${n.toLocaleString('es-ES')} ${n === 1 ? 'producto' : 'productos'} más ${n === 1 ? 'barato' : 'baratos'}`,
    sortDiscount: 'Mayor bajada',
    more: 'Ver más bajadas',
    none: 'No hay bajadas en esta categoría',
    noneText: 'Prueba con otra categoría.',
  },
  ca: {
    top: 'Les baixades més grans',
    topSub: 'Els productes que més han baixat de preu aquesta setmana.',
    allOffers: 'Totes les baixades',
    offers: (n) => `${n.toLocaleString('ca-ES')} ${n === 1 ? 'producte més barat' : 'productes més barats'}`,
    sortDiscount: 'Baixada més gran',
    more: 'Veure més baixades',
    none: 'No hi ha baixades en aquesta categoria',
    noneText: 'Prova amb una altra categoria.',
  },
};

const SORTERS = {
  discount: byDiscount,
  price: (a, b) => a.price - b.price || a.name.localeCompare(b.name, 'es'),
  name: (a, b) => a.label.localeCompare(b.label, 'es'),
};

function readParams() {
  const q = new URLSearchParams(window.location.search);
  return {
    cat: q.get('cat'),
    kind: KIND_ORDER.includes(q.get('tipo')) ? q.get('tipo') : null,
    order: SORTERS[q.get('orden')] ? q.get('orden') : 'discount',
  };
}

const Chevron = ({ open }) => (
  <svg className={`cmp-side-chev${open ? ' is-open' : ''}`} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
);

/** Sección plegable del lateral. Plegada, enseña lo que está elegido. */
function FilterSection({ id, title, open, onToggle, selected, children }) {
  return (
    <nav className={`ofb-sec${open ? ' is-open' : ''}`} aria-label={title}>
      <button type="button" className="ofb-sec-head" aria-expanded={open} aria-controls={`ofb-sec-${id}`} onClick={onToggle}>
        <span className="ofb-nav-title">{title}</span>
        {!open && selected && <em className="ofb-sec-sel">{selected}</em>}
        <Chevron open={open} />
      </button>
      {open && <div id={`ofb-sec-${id}`}>{children}</div>}
    </nav>
  );
}

function FilterNav({ c, lang, categories, catCounts, kindCounts, cat, kind, onCat, onKind, open, onToggle }) {
  const catName = categories.find((g) => g.id === cat)?.name[lang];
  return (
    <div className="ofb-nav">
      {kindCounts.all != null && Object.keys(kindCounts.base).length > 0 && <FilterSection id="kinds" title={c.kinds} open={open.kinds} onToggle={() => onToggle('kinds')} selected={kind && KIND_LABEL[lang][kind]}>
        <button type="button" className={`cmp-side-all${kind ? '' : ' is-on'}`} aria-current={kind ? undefined : 'true'} onClick={() => onKind(null)}>
          <span>{c.allKinds}</span>
          <em className="ofb-count">{kindCounts.all}</em>
        </button>
        <ul className="cmp-side-list">
          {KIND_ORDER.filter((k) => kindCounts.base[k]).map((k) => (
            <li key={k}>
              <button
                type="button"
                className={`cmp-side-root${kind === k ? ' is-on' : ''}${kindCounts[k] ? '' : ' is-empty'}`}
                aria-current={kind === k ? 'true' : undefined}
                onClick={() => onKind(k)}
              >
                <span>{KIND_LABEL[lang][k]}</span>
                <em className="ofb-count">{kindCounts[k] ?? 0}</em>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>}
      <FilterSection id="cats" title={c.categories} open={open.cats} onToggle={() => onToggle('cats')} selected={catName}>
        <button type="button" className={`cmp-side-all${cat ? '' : ' is-on'}`} aria-current={cat ? undefined : 'true'} onClick={() => onCat(null)}>
          <span>{c.allOffers}</span>
          <em className="ofb-count">{catCounts.all}</em>
        </button>
        <ul className="cmp-side-list">
          {categories.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                className={`cmp-side-root${cat === g.id ? ' is-on' : ''}${catCounts[g.id] ? '' : ' is-empty'}`}
                aria-current={cat === g.id ? 'true' : undefined}
                onClick={() => onCat(g.id)}
              >
                <span>{g.name[lang]}</span>
                <em className="ofb-count">{catCounts[g.id] ?? 0}</em>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>
    </div>
  );
}

function TopRow({ c, items }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };
  if (!items.length) return null;
  return (
    <section className="ofb-top">
      <div className="ofb-top-head">
        <div>
          <h2>{c.top}</h2>
          <p>{c.topSub}</p>
        </div>
        <div className="ofb-top-arrows">
          <button type="button" onClick={() => scroll(-1)} aria-label={c.scrollLeft}><Icon.arrow width="18" height="18" style={{ rotate: '180deg' }} /></button>
          <button type="button" onClick={() => scroll(1)} aria-label={c.scrollRight}><Icon.arrow width="18" height="18" /></button>
        </div>
      </div>
      <div className="ofb-top-row" ref={ref}>
        {items.map((p, i) => <ProductCard key={p.uid} index={i} product={p} isBest={false} />)}
      </div>
    </section>
  );
}

function Browser({ lang, store, categories, kinds, top, initial, total, dataUrl, mode = 'ofertas' }) {
  const base = COPY[lang] ?? COPY.es;
  const c = mode === 'bajadas' ? { ...base, ...(DROP_COPY[lang] ?? DROP_COPY.es) } : base;
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);
  const [cat, setCat] = useState(null);
  const [kind, setKind] = useState(null);
  const [order, setOrder] = useState('discount');
  const [visible, setVisible] = useState(PAGE);
  const [drawer, setDrawer] = useState(false);
  // Secciones del lateral abiertas (compartido por el lateral y el cajón móvil).
  const [open, setOpen] = useState({ kinds: true, cats: true });
  const toggleSection = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));
  const mainRef = useRef(null);

  useEffect(() => {
    const p = readParams();
    setCat(p.cat);
    setKind(p.kind);
    setOrder(p.order);
    // Compilada se sirve tal cual; `astro dev` (trailingSlash: always) la quiere con barra.
    const get = (url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))));
    get(dataUrl)
      .catch(() => get(`${dataUrl}/`))
      .then((d) => setRows(d.rows))
      .catch(() => setFailed(true));
  }, [dataUrl]);

  // Filtros en la URL (sin crear historial).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const set = (k, v) => (v ? q.set(k, v) : q.delete(k));
    set('cat', cat);
    set('tipo', kind);
    set('orden', order === 'discount' ? null : order);
    const search = q.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
  }, [cat, kind, order]);

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

  const all = useMemo(() => (rows ?? initial).map((r) => unpackOffer(r, store, lang)), [rows, initial, store, lang]);
  const topItems = useMemo(() => top.map((r) => unpackOffer(r, store, lang)), [top, store, lang]);
  const filtering = !!(cat || kind || order !== 'discount');
  const waiting = !rows && filtering && !failed;

  const filtered = useMemo(() => all
    .filter((p) => (!cat || p.category === cat) && (!kind || p.kind === kind))
    .sort(SORTERS[order]), [all, cat, kind, order]);
  // Sin filtros, las mayores rebajas ya están arriba: no se repiten en la lista.
  const topIds = useMemo(() => new Set(top.map((r) => String(r.i))), [top]);
  const listed = useMemo(() => (filtering ? filtered : filtered.filter((p) => !topIds.has(p.id))), [filtering, filtered, topIds]);

  // Recuentos cruzados: categorías según el tipo elegido y al revés.
  const catCounts = useMemo(() => {
    if (!rows) return { all: total, ...Object.fromEntries(categories.map((g) => [g.id, g.count])) };
    const m = { all: 0 };
    for (const p of all) if (!kind || p.kind === kind) { m.all += 1; m[p.category] = (m[p.category] ?? 0) + 1; }
    return m;
  }, [rows, all, kind, categories, total]);
  const kindCounts = useMemo(() => {
    const base = Object.fromEntries(kinds.map((k) => [k.k, k.count]));
    if (!rows) return { all: total, base, ...base };
    const m = { all: 0, base };
    for (const p of all) if (!cat || p.category === cat) { m.all += 1; m[p.kind] = (m[p.kind] ?? 0) + 1; }
    return m;
  }, [rows, all, cat, kinds, total]);

  const choose = (setter) => (value) => {
    setter(value);
    setVisible(PAGE);
    setDrawer(false);
    const top = mainRef.current?.getBoundingClientRect().top;
    if (top != null && top < 0) mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const onCat = choose(setCat);
  const onKind = choose(setKind);

  const catName = categories.find((g) => g.id === cat)?.name[lang];
  const title = catName ?? c.allOffers;
  const count = rows ? filtered.length : (filtering ? null : total);
  const shown = listed.slice(0, visible);
  const hasMore = rows ? listed.length > visible : total > shown.length;

  const nav = (
    <FilterNav c={c} lang={lang} categories={categories} catCounts={catCounts} kindCounts={kindCounts} cat={cat} kind={kind} onCat={onCat} onKind={onKind} open={open} onToggle={toggleSection} />
  );

  return (
    <div className="cmp ofb">
      <TopRow c={c} items={topItems} />

      <div className="cmp-store-layout ofb-layout">
        <aside className="cmp-side ofb-side">{nav}</aside>

        <section className="cmp-store-main ofb-main" ref={mainRef}>
          <button type="button" className="cmp-side-open" onClick={() => setDrawer(true)}>
            <Icon.list width="18" height="18" />
            <span>{c.filters}</span>
            <em>{[catName, kind && KIND_LABEL[lang][kind]].filter(Boolean).join(' · ') || c.allOffers}</em>
          </button>

          <div className="cmp-results-head">
            <div>
              {kind && <span className="cmp-eyebrow">{KIND_LABEL[lang][kind]}</span>}
              <h2 aria-live="polite">{title}</h2>
              {count != null && <p className="cmp-store-count">{c.offers(count)}</p>}
            </div>
            <label className="cmp-sort">
              <span>{c.sort}</span>
              <select value={order} onChange={(e) => choose(setOrder)(e.target.value)}>
                <option value="discount">{c.sortDiscount}</option>
                <option value="price">{c.sortPrice}</option>
                <option value="name">{c.sortName}</option>
              </select>
            </label>
          </div>

          {waiting ? (
            <div className="cmp-grid-cards">{Array.from({ length: 9 }, (_, i) => <SkeletonCard key={i} />)}</div>
          ) : shown.length === 0 ? (
            <div className="cmp-empty">
              <span className="cmp-empty-icon"><Icon.search width="28" height="28" /></span>
              <h3>{c.none}</h3>
              <p>{c.noneText}</p>
              <div className="cmp-popular cmp-popular-center">
                <button type="button" className="cmp-chip" onClick={() => { onCat(null); setKind(null); }}>{c.reset}</button>
              </div>
            </div>
          ) : (
            <>
              <div className="cmp-grid-cards">
                {shown.map((p, i) => <ProductCard key={p.uid} index={i % PAGE} product={p} isBest={false} />)}
              </div>
              {hasMore && (
                <div className="cmp-more">
                  <button type="button" className="cmp-chip" disabled={!rows} onClick={() => setVisible((v) => v + PAGE)}>
                    {c.more}
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
          <aside className="cmp-drawer" role="dialog" aria-modal="true" aria-label={c.filters}>
            <div className="cmp-drawer-head">
              <strong>{c.filters}</strong>
              <button type="button" className="cmp-sheet-x" onClick={() => setDrawer(false)} aria-label={c.close}>
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

export default function OffersBrowser(props) {
  return <LangProvider lang={props.lang}><Browser {...props} /></LangProvider>;
}
