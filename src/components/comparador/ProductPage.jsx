import { useEffect, useMemo, useRef, useState } from 'react';
import NavZoneChip, { useNavSlot } from './NavZoneChip.jsx';
import { catalogPath } from '../../lib/rutas.js';
import { REFERENCE_CP, STORES, STORE_BY_KEY, regionFromPostalCode, storesForPostalCode } from '../../data/comparadorZonas.js';
import { apiConfigured } from '../../lib/comparadorApi.js';
import {
  fetchProductDetail, findSameEan, largeImage, nutritionTable, parseProductPath, parseProductQuery, productImageAlt, productLink,
  productPath,
} from '../../lib/productoApi.js';
import { Icon, ProductImage, StoreLogo, fmt, ppuText } from './ui.jsx';
import CompareAside from './CompareAside.jsx';
import { AdTop, AdWide } from './AdInFeed.jsx';
import FoodIndexCard, { FoodIndexBadge } from './FoodIndexCard.jsx';
import { fetchOffFoodIndex } from '../../lib/indiceAlimentario.js';
import PostalModal, { readCp, saveCp } from './PostalModal.jsx';
import { LangProvider, useT } from './i18n.jsx';

// Ficha de producto (/producto/<súper>/<id>/): toda la información que publica
// la cadena, como la ficha de la app, y en el lateral la comparación con los
// súper de la zona. Dos modos:
//  · generada al compilar (`initial`): el HTML ya trae la ficha con precios de
//    referencia y lo que lee Google; en el navegador se refresca con el CP.
//  · el resto de productos: la página base se sirve para cualquier ruta de
//    /producto/ y la ficha se carga aquí (va con noindex).

const SECTIONS = [
  ['description', 'pdDescription'],
  ['denomination', 'pdDenomination'],
  ['ingredients', 'pdIngredients'],
  ['allergens', 'pdAllergens'],
  ['nutrition', 'pdNutrition'],
  ['conservation', 'pdConservation'],
  ['preparation', 'pdPreparation'],
  ['origin', 'pdOrigin'],
  ['operator', 'pdOperator'],
];

function Nutrition({ text }) {
  const t = useT();
  const table = nutritionTable(text);
  if (!table) return <p className="pd-text">{text}</p>;
  return (
    <>
      {table.head && <p className="pd-nutri-head">{table.head}</p>}
      <table className="pd-nutri">
        <thead className="cmp-sr"><tr><th scope="col">{t.pdNutrient}</th><th scope="col">{t.pdAmount}</th></tr></thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i} className={i > 0 && /de las cuales|de los cuales|saturad|az[uú]car|sucres|saturats/i.test(r.name) ? 'is-sub' : ''}>
              <th scope="row">{r.name}</th>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** Resumen escrito de la comparativa: texto propio de la ficha (también para Google). */
function summaryText(t, product, rows) {
  const all = [product, ...rows].sort((a, b) => a.price - b.price);
  const low = all[0];
  const high = all[all.length - 1];
  if (high.price - low.price < 0.005) return null;
  const name = (product.label ?? '').replace(/[.\s]+$/, '');
  return t.pdSummary({
    name,
    price: fmt(product.price),
    store: STORE_BY_KEY[product.store].name,
    n: all.length,
    low: fmt(low.price),
    lowStore: STORE_BY_KEY[low.store].name,
    high: fmt(high.price),
    highStore: STORE_BY_KEY[high.store].name,
    pct: Math.round(((high.price - low.price) / low.price) * 100),
    here: low.uid === product.uid || Math.abs(low.price - product.price) < 0.005,
  });
}

function SameProduct({ rows, zoned, product }) {
  const t = useT();
  if (!rows?.length) return null;
  const min = rows[0].price;
  const summary = summaryText(t, product, rows);
  return (
    <section className="pd-card pd-same" aria-labelledby="pd-same-title">
      <h2 id="pd-same-title">{t.pdSameTitle}</h2>
      {summary && <p className="pd-summary-text">{summary}</p>}
      <p className="pd-card-lead">{t.pdSameLead}</p>
      <ul>
        {rows.map((r) => (
          <li key={r.uid}>
            <a href={productLink(r.store, r.id, t.lang)}>
              <StoreLogo store={r.store} size={34} />
              <span className="pd-same-info">
                <strong>{STORE_BY_KEY[r.store].name}</strong>
                <span>{r.label}{r.format ? ` · ${r.format}` : ''}</span>
              </span>
              <span className="pd-same-price">
                <strong>{fmt(r.price)}</strong>
                {r.price <= min + 0.001 && rows.length > 1 && <em>{t.pdCheapestSame}</em>}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="cmp-note">{zoned ? t.pdSameZone : t.pdSameRef}</p>
    </section>
  );
}

/**
 * Marca propia (ficha generada al compilar): alternativas PARECIDAS de otras
 * cadenas, por precio por kilo, litro o unidad. Nunca se presentan como el
 * mismo producto (eso es SameProduct, por EAN).
 */
function SimilarProducts({ rows, product, total, cheaper }) {
  const t = useT();
  if (!rows?.length || product.ppu == null) return null;
  const low = rows[0];
  const summary = t.pdSimilarSummary({
    name: (product.label ?? '').replace(/[.\s]+$/, ''),
    ppu: ppuText(product),
    store: STORE_BY_KEY[product.store].name,
    unitWord: t.pdUnitWord[product.unit] ?? product.unit,
    n: total ?? rows.length,
    cheaper: cheaper ?? rows.filter((r) => r.ppu < product.ppu - 0.005).length,
    low: ppuText(low),
    lowName: (low.label ?? '').replace(/[.\s]+$/, ''),
    lowStore: STORE_BY_KEY[low.store].name,
  });
  return (
    <section className="pd-card pd-same pd-similar" aria-labelledby="pd-similar-title">
      <h2 id="pd-similar-title">{t.pdSimilarTitle}</h2>
      <p className="pd-summary-text">{summary}</p>
      <p className="pd-card-lead">{t.pdSimilarLead}</p>
      <ul>
        {rows.map((r, i) => (
          <li key={r.uid}>
            <a href={productLink(r.store, r.id, t.lang)}>
              <StoreLogo store={r.store} size={34} />
              <span className="pd-same-info">
                <strong>{STORE_BY_KEY[r.store].name}</strong>
                <span>{r.label}{r.format ? ` · ${r.format}` : ''}</span>
              </span>
              <span className="pd-same-price">
                <strong>{ppuText(r)}</strong>
                {i === 0 && r.ppu < product.ppu - 0.005 ? <em>{t.pdCheapestSame}</em> : <small>{fmt(r.price)}</small>}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="cmp-note">{t.pdSimilarRef}</p>
      {/* El listado de marca blanca solo existe en castellano. */}
      <a className="pd-related-all" href={`${catalogPath(product.store, 'es')}marca-blanca/`}>
        {t.pdOwnBrandAll(STORE_BY_KEY[product.store].name)} →
      </a>
    </section>
  );
}

function Skeleton() {
  return (
    <div className="pd-hero" aria-hidden="true">
      <div className="pd-media"><span className="cmp-skel-block" style={{ width: '70%', height: '70%', borderRadius: 18 }} /></div>
      <div className="pd-summary">
        <span className="cmp-skel-block" style={{ width: '30%', height: 14 }} />
        <span className="cmp-skel-block" style={{ width: '90%', height: 30, marginTop: 14 }} />
        <span className="cmp-skel-block" style={{ width: '60%', height: 30, marginTop: 8 }} />
        <span className="cmp-skel-block" style={{ width: '40%', height: 40, marginTop: 28 }} />
      </div>
    </div>
  );
}

function ProductView({
  store: storeProp, id: idProp, initial, initialSame, initialSimilar, similarStores, cheaperStores, related = [],
}) {
  const t = useT();
  const [route, setRoute] = useState(storeProp ? { store: storeProp, id: idProp } : null);
  const [ready, setReady] = useState(false);
  const [cp, setCp] = useState(null);
  const [editingCp, setEditingCp] = useState(false);
  const [detail, setDetail] = useState(initial ?? null);
  const [status, setStatus] = useState(initial ? 'done' : 'loading');
  const [same, setSame] = useState(initialSame ?? []);
  const [sameZoned, setSameZoned] = useState(false);

  // Página base: el producto sale de la URL.
  useEffect(() => {
    const start = (parsed) => {
      if (parsed) setRoute(parsed);
      else if (!storeProp) setStatus('missing');
      setCp(readCp());
      setReady(true);
    };
    if (storeProp) { start(null); return; }
    const fromQuery = parseProductQuery(window.location.search);
    const parsed = parseProductPath(window.location.pathname) ?? fromQuery;
    if (!fromQuery) { start(parsed); return; }
    // Desde la página base (?p=…): si la ficha está generada, a su dirección
    // limpia. Hasta saberlo no se pinta la ficha ni se piden anuncios: si no,
    // el anuncio de arriba salía, se iba con el salto y volvía a salir.
    const pretty = productPath(fromQuery.store, fromQuery.id, t.lang);
    fetch(pretty, { method: 'HEAD', redirect: 'manual' })
      .then((res) => { if (res.status === 200) window.location.replace(pretty); else start(parsed); })
      .catch(() => start(parsed));
  }, [storeProp]);

  const store = route?.store ?? null;
  const zoneStores = useMemo(() => (cp ? storesForPostalCode(cp) : []), [cp]);
  const inZone = !cp || zoneStores.some((s) => s.key === store);

  // Ficha con el precio de la zona (o el de referencia sin CP / fuera de zona).
  useEffect(() => {
    if (!ready || !route || !apiConfigured) {
      if (ready && route && !apiConfigured && !initial) setStatus('error');
      return undefined;
    }
    const ctrl = new AbortController();
    if (!initial) setStatus('loading');
    fetchProductDetail(route.store, route.id, { cp: inZone ? cp : null, lang: t.lang, signal: ctrl.signal })
      .then((d) => {
        if (d) { setDetail(d); setStatus('done'); } else if (!initial) setStatus('missing');
      })
      .catch(() => { if (!ctrl.signal.aborted && !initial) setStatus('error'); });
    return () => ctrl.abort();
  }, [ready, route, cp, inZone, t.lang]);

  // Mismo EAN en otras cadenas: las de la zona con CP; todas sin él.
  const ean = detail?.ean ?? null;
  useEffect(() => {
    if (!ready || !detail || !ean || !apiConfigured) return undefined;
    const ctrl = new AbortController();
    const stores = cp ? zoneStores.map((s) => s.key) : STORES.map((s) => s.key);
    findSameEan(detail, { cp, stores, lang: t.lang, signal: ctrl.signal })
      .then((rows) => { if (!ctrl.signal.aborted) { setSame(rows); setSameZoned(!!cp); } })
      .catch(() => {});
    return () => ctrl.abort();
  }, [ready, detail?.uid, ean, cp, zoneStores, t.lang]);

  // Índice alimentario: Open Food Facts por EAN si tiene un Nutri-Score
  // aplicable (como la app); si no, el estimado con la tabla de la ficha.
  const [offIndex, setOffIndex] = useState(null);
  useEffect(() => {
    setOffIndex(null);
    if (!ean) return undefined;
    const ctrl = new AbortController();
    fetchOffFoodIndex(ean, { signal: ctrl.signal }).then((info) => { if (info) setOffIndex(info); }).catch(() => {});
    return () => ctrl.abort();
  }, [ean]);
  const foodIndex = offIndex ?? detail?.nutritionIndex ?? null;

  // Opción más barata en otra cadena (la calcula el ranking de CompareAside).
  const [cheaper, setCheaper] = useState(null);
  const goCheaper = () => {
    const row = cheaper && document.getElementById(`cmp-row-${cheaper.row.uid}`);
    if (!row) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    row.classList.remove('is-flash');
    void row.offsetWidth; // reinicia la animación si se pulsa dos veces
    row.classList.add('is-flash');
  };

  // En móvil y tableta (navbar con hamburguesa) el código postal va en el
  // navbar, junto al logo (#qf-nav-slot de SiteNav); en escritorio, en la ficha.
  const navSlot = useNavSlot();

  // En la página base el título llega con la ficha.
  useEffect(() => {
    if (!storeProp && detail) document.title = `${detail.label} · ${STORE_BY_KEY[detail.store].name} | QuéFalta`;
  }, [storeProp, detail]);

  useEffect(() => {
    document.documentElement.classList.toggle('cmp-locked', editingCp);
    return () => document.documentElement.classList.remove('cmp-locked');
  }, [editingCp]);

  // El lateral de comparación cabe siempre en la pantalla: su alto máximo va
  // desde donde empieza (debajo de las migas al cargar, pegado arriba al bajar)
  // hasta el borde inferior de la ventana.
  const asideRef = useRef(null);
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return undefined;
    const fit = () => {
      // Nunca por encima de su posición pegada (76 px, como `top` en producto.css).
      // Medidas en píxeles de pantalla → se pasan a px CSS con el zoom de escritorio
      // (Layout.astro), que reduce la web en portátiles.
      const z = parseFloat(document.documentElement.style.zoom) || 1;
      const top = Math.max(el.getBoundingClientRect().top / z, 76);
      el.style.setProperty('--pd-aside-max', `${Math.max(320, window.innerHeight / z - top - 16)}px`);
    };
    fit();
    window.addEventListener('scroll', fit, { passive: true });
    window.addEventListener('resize', fit);
    return () => {
      window.removeEventListener('scroll', fit);
      window.removeEventListener('resize', fit);
    };
  }, [status]);

  const saveZone = (value) => {
    saveCp(value);
    setCp(value);
    setEditingCp(false);
  };

  const storeInfo = store ? STORE_BY_KEY[store] : null;
  const storeHref = catalogPath(store, t.lang);
  const modal = editingCp && <PostalModal initial={cp} canClose onSave={saveZone} onClose={() => setEditingCp(false)} />;

  if (status === 'missing' || status === 'error') {
    return (
      <div className="cmp pd">
        <div className="cmp-empty pd-missing">
          <span className="cmp-empty-icon"><Icon.search width="28" height="28" /></span>
          <h1>{status === 'error' ? t.pdLoadError : t.pdNotFound}</h1>
          <p>{status === 'error' ? t.checkConnection : t.pdNotFoundText}</p>
          <div className="cmp-popular cmp-popular-center">
            <a className="cmp-btn cmp-btn-primary" href={t.pdHomeHref}>{t.pdSearch}<Icon.arrow width="16" height="16" /></a>
          </div>
        </div>
      </div>
    );
  }

  const d = detail;
  const zoneLabel = cp && inZone
    ? t.pdZonePrice(cp, t.region(regionFromPostalCode(cp)))
    : t.pdRefPrice(t.region(regionFromPostalCode(REFERENCE_CP[store] ?? '28013')));
  const sections = d ? SECTIONS.filter(([key]) => d.info[key]) : [];
  const facts = d ? [
    [t.pdStore, storeInfo?.name],
    [t.pdBrand, d.brand],
    [t.pdFormat, d.format],
    [t.pdCategory, d.category],
    [t.pdEan, d.ean],
  ].filter(([, v]) => v) : [];

  return (
    <div className="cmp pd">
      {ready && <AdWide />}

      {/* Ficha · lateral · resto de la ficha: en móvil la comparación va tras el precio. */}
      <div className="pd-layout">
        <div className="pd-top">
          {/* Las migas van dentro de la columna: así el lateral de comparar empieza a su altura. */}
          <nav className="pd-crumbs" aria-label={t.pdCrumbs}>
            <ol>
              <li><a href={t.pdHomeHref}>{t.pdHome}</a></li>
              {storeInfo && <li><a href={storeHref}>{storeInfo.name}</a></li>}
              {d?.category && <li><span>{d.category}</span></li>}
            </ol>
          </nav>
          {!d ? <Skeleton /> : (
            <div className="pd-hero">
              <AdTop />
              <div className="pd-mediacol">
              <div className={`pd-mediarow${foodIndex ? ' has-fi' : ''}`}>
                {foodIndex && <FoodIndexBadge info={foodIndex} href="#indice" />}
                <div className="pd-media">
                  <ProductImage
                    key={d.image ?? 'none'}
                    src={largeImage(d.image)}
                    fallback={d.image}
                    alt={productImageAlt(d, storeInfo?.name, t.lang)}
                    priority
                  />
                  {d.promo && <span className="pd-promo">{d.promo}</span>}
                </div>
              </div>
              {cheaper && (
                <button type="button" className="pd-cheaper" onClick={goCheaper}>
                  <span className="pd-cheaper-text"><strong>{t.pdCheaper}</strong></span>
                  <span className="pd-cheaper-go" aria-hidden="true"><Icon.arrow width="16" height="16" /></span>
                </button>
              )}
              </div>
              <div className="pd-summary">
                <a className="pd-store" href={storeHref}>
                  <StoreLogo store={d.store} size={30} />
                  {storeInfo.name}
                </a>
                <div className="pd-titlerow">
                  <div className="pd-titlecol">
                    <h1>{d.label}</h1>
                    {(d.brand || d.format) && <p className="pd-sub">{[d.brand, d.format].filter(Boolean).join(' · ')}</p>}
                  </div>
                  <div className="pd-price">
                    <strong>{fmt(d.price)}</strong>
                    {d.offer?.was && <s className="pd-was">{fmt(d.offer.was)}</s>}
                    {ppuText(d) && <span>{ppuText(d)}</span>}
                  </div>
                </div>
                <div className="pd-badges">
                  {d.glutenFree && <span className="pd-pill">{t.pdGlutenFree}</span>}
                  {d.nutriScore && /^[A-E]$/.test(d.nutriScore) && (
                    <span className={`pd-nutriscore is-${d.nutriScore.toLowerCase()}`}>Nutri-Score <strong>{d.nutriScore}</strong></span>
                  )}
                </div>
                {d.promoText && <p className="pd-promo-text">{d.promoText}</p>}
                {navSlot ? (
                  <NavZoneChip
                    slot={navSlot}
                    pre={cp && inZone ? t.pdZonePrice(cp, '').split(cp)[0] : null}
                    cp={cp}
                    region={cp && !inZone ? null : t.region(regionFromPostalCode(cp && inZone ? cp : (REFERENCE_CP[store] ?? '28013')))}
                    title={zoneLabel}
                    edit={cp ? t.change : t.pdNavChooseZone}
                    onEdit={() => setEditingCp(true)}
                  />
                ) : (
                  <button type="button" className={`cmp-zone-chip pd-zone${cp && inZone ? '' : ' is-empty'}`} onClick={() => setEditingCp(true)}>
                    <Icon.pin width="15" height="15" />
                    {zoneLabel}
                    <span className="cmp-zone-chip-edit">{cp ? t.change : t.pdChooseZone}</span>
                  </button>
                )}
                {cp && !inZone && <p className="cmp-note">{t.pdOutOfZone(storeInfo.name)}</p>}
                {d.storeUrl && (
                  <a className="pd-out" href={d.storeUrl} target="_blank" rel="noopener noreferrer nofollow">
                    {t.pdOpenIn(storeInfo.name)}
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="pd-aside" aria-label={t.cmpEyebrow}>
          <div className="pd-aside-inner" ref={asideRef}>
            {d ? (
              <CompareAside product={d} cp={cp} zoneStores={zoneStores} exact={sameZoned ? same : []} onEditZone={() => setEditingCp(true)} onCheaper={setCheaper} />
            ) : (
              <div className="pd-aside-body"><span className="cmp-skel-block" style={{ width: '100%', height: 220, borderRadius: 18 }} /></div>
            )}
          </div>
        </aside>

        <div className="pd-info">
          {d && (
            <>
              {foodIndex && <FoodIndexCard info={foodIndex} />}
              {sections.length === 0 && <p className="pd-card pd-noinfo">{t.pdNoInfo}</p>}
              {sections.map(([key, label]) => (
                <section key={key} className="pd-card">
                  <h2>{t[label]}</h2>
                  {key === 'nutrition' ? <Nutrition text={d.info.nutrition} /> : <p className="pd-text">{d.info[key]}</p>}
                </section>
              ))}

              <SameProduct rows={same} zoned={sameZoned} product={d} />
              <SimilarProducts rows={initialSimilar} product={d} total={similarStores} cheaper={cheaperStores} />

              <section className="pd-card">
                <h2>{t.pdDetails}</h2>
                <dl className="pd-facts">
                  {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                </dl>
              </section>

              {related.length > 0 && (
                <section className="pd-card pd-related" aria-labelledby="pd-related-title">
                  <h2 id="pd-related-title">{t.pdRelated}</h2>
                  <ul>
                    {related.map((r) => (
                      <li key={`${r.store}:${r.id}`}>
                        <a href={productPath(r.store, r.id, t.lang)}>
                          <span className="pd-related-img"><ProductImage src={r.image} /></span>
                          <span className="pd-related-info">
                            <strong>{r.label}</strong>
                            <small>{r.kind === 'own' ? t.pdRelatedOwnMeta(r.alternatives) : t.pdRelatedMeta(r.stores, fmt(r.low))}</small>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a className="pd-related-all" href="/productos/">{t.pdAllProducts} →</a>
                </section>
              )}

              <p className="cmp-disclaimer">{t.pdSource(storeInfo.name)} {t.disclaimer}</p>
            </>
          )}
        </div>
      </div>

      {modal}
    </div>
  );
}

export default function ProductPage({ lang = 'es', ...props }) {
  return <LangProvider lang={lang}><ProductView {...props} /></LangProvider>;
}
