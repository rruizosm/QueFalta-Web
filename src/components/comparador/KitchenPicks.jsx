import { useEffect, useRef, useState } from 'react';
import { CATEGORIAS, COCINA, COCINA_TEXT, amazonUrl } from '../../data/cocina.js';
import { Icon } from './ui.jsx';

// Sección «Productos para el hogar» (afiliados de Amazon). En la portada muestra
// `limit` productos y un enlace a la página completa; en /cocina/ se ven todos,
// con filtro por categoría.

// Ilustración de cocina del banner (vectorial, sin fotos de terceros). Va en
// dos capas para el parallax (fondo y encimera) y tiene dos detalles vivos, el
// sol y el vapor de la olla, que solo se animan con el banner en pantalla.
function KitchenArt() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-live', e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <svg ref={ref} className="kh-art" viewBox="0 0 520 300" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
      <g className="kh-l-back">
      {/* ventana */}
      <rect x="40" y="38" width="130" height="110" rx="10" fill="#fff" opacity=".9" />
      <rect x="48" y="46" width="114" height="94" rx="6" fill="#cfe6ff" />
      <circle className="kh-sun-glow" cx="132" cy="74" r="22" fill="#ffe08a" opacity=".35" />
      <circle cx="132" cy="74" r="14" fill="#ffe08a" />
      <path d="M48 128 q30 -26 58 -6 t56 -10 v28 h-114z" fill="#b7dca8" />
      <rect x="103" y="46" width="4" height="94" fill="#fff" />
      <rect x="48" y="91" width="114" height="4" fill="#fff" />
      {/* armarios altos */}
      <rect x="210" y="26" width="270" height="86" rx="10" fill="#fff" opacity=".95" />
      <rect x="220" y="36" width="78" height="66" rx="6" fill="#eef4fb" />
      <rect x="306" y="36" width="78" height="66" rx="6" fill="#eef4fb" />
      <rect x="392" y="36" width="78" height="66" rx="6" fill="#eef4fb" />
      <rect x="288" y="62" width="4" height="16" rx="2" fill="#9db3cc" />
      <rect x="312" y="62" width="4" height="16" rx="2" fill="#9db3cc" />
      <rect x="460" y="62" width="4" height="16" rx="2" fill="#9db3cc" />
      {/* lámpara */}
      <line x1="190" y1="0" x2="190" y2="40" stroke="#33415c" strokeWidth="2" />
      <path d="M170 52 a20 14 0 0 1 40 0z" fill="#33415c" />
      <ellipse cx="190" cy="54" rx="8" ry="3" fill="#ffe08a" />
      {/* estante con botes */}
      <rect x="210" y="138" width="150" height="6" rx="3" fill="#c99a6b" />
      <rect x="220" y="112" width="20" height="26" rx="5" fill="#fff" stroke="#c9d6e4" />
      <rect x="220" y="120" width="20" height="10" fill="#f6c27a" />
      <rect x="248" y="106" width="22" height="32" rx="5" fill="#fff" stroke="#c9d6e4" />
      <rect x="248" y="118" width="22" height="14" fill="#e9b07a" />
      <rect x="278" y="114" width="18" height="24" rx="5" fill="#fff" stroke="#c9d6e4" />
      <rect x="278" y="122" width="18" height="10" fill="#9cc98a" />
      <path d="M318 138 q-6 -22 6 -30 q12 8 6 30z" fill="#7bbf6a" />
      <rect x="312" y="128" width="24" height="10" rx="3" fill="#e0805a" />
      </g>
      <g className="kh-l-front">
      {/* encimera */}
      <rect x="0" y="206" width="520" height="14" fill="#f3e3cf" />
      <rect x="0" y="220" width="520" height="80" fill="#fff" opacity=".96" />
      <rect x="20" y="232" width="110" height="58" rx="6" fill="#eef4fb" />
      <rect x="142" y="232" width="110" height="58" rx="6" fill="#eef4fb" />
      <rect x="264" y="232" width="110" height="58" rx="6" fill="#eef4fb" />
      <rect x="386" y="232" width="110" height="58" rx="6" fill="#eef4fb" />
      <rect x="64" y="240" width="22" height="4" rx="2" fill="#9db3cc" />
      <rect x="186" y="240" width="22" height="4" rx="2" fill="#9db3cc" />
      <rect x="308" y="240" width="22" height="4" rx="2" fill="#9db3cc" />
      <rect x="430" y="240" width="22" height="4" rx="2" fill="#9db3cc" />
      {/* frutero */}
      <path d="M40 206 q36 22 72 0z" fill="#fff" stroke="#c9d6e4" />
      <circle cx="62" cy="198" r="10" fill="#ef6b5b" />
      <circle cx="80" cy="194" r="10" fill="#f6b24a" />
      <circle cx="96" cy="199" r="9" fill="#9cc98a" />
      {/* olla y cazo */}
      <rect x="170" y="172" width="64" height="34" rx="8" fill="#33415c" />
      <rect x="164" y="166" width="76" height="8" rx="4" fill="#4a5a78" />
      <rect x="196" y="158" width="12" height="8" rx="3" fill="#4a5a78" />
      <g className="kh-steam" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M186 150 q4 -8 0 -16" />
        <path d="M202 146 q4 -8 0 -16" />
        <path d="M218 150 q4 -8 0 -16" />
      </g>
      {/* tabla y báscula */}
      <rect x="268" y="196" width="80" height="10" rx="5" fill="#d8a776" />
      <rect x="370" y="186" width="56" height="20" rx="6" fill="#fff" stroke="#c9d6e4" />
      <rect x="382" y="191" width="32" height="9" rx="2" fill="#2b6fd6" opacity=".85" />
      {/* tarro grande */}
      <rect x="448" y="160" width="40" height="46" rx="10" fill="#fff" stroke="#c9d6e4" />
      <rect x="448" y="176" width="40" height="22" fill="#f6c27a" opacity=".8" />
      <rect x="452" y="152" width="32" height="10" rx="4" fill="#c99a6b" />
      </g>
    </svg>
  );
}

export default function KitchenPicks({ lang = 'es', limit, heading = 'h2' }) {
  const t = COCINA_TEXT[lang] ?? COCINA_TEXT.es;
  const [cat, setCat] = useState(null);
  const full = !limit;
  const pool = cat ? COCINA.filter((it) => it.cat === cat) : COCINA;
  const items = limit ? pool.slice(0, limit) : pool;
  const cats = Object.keys(CATEGORIAS).filter((c) => COCINA.some((it) => it.cat === c));
  const H = heading;

  return (
    <section className={`cmp-section kh${full ? ' kh-full' : ''}`}>
      <div className="kh-banner">
        <div className="kh-banner-text">
          <span className="kh-badge">{t.badge}</span>
          <H className="kh-title">{t.eyebrow}</H>
          <p className="kh-lead">{t.lead}</p>
          {!full && (
            <a className="kh-banner-cta" href={t.href}>
              {t.count(COCINA.length)} <Icon.arrow width="15" height="15" />
            </a>
          )}
        </div>
        <KitchenArt />
      </div>

      {full && (
        <div className="kh-filters" role="group">
          <button type="button" className={`kh-chip${cat ? '' : ' is-on'}`} onClick={() => setCat(null)}>
            {t.allShort} <em>{COCINA.length}</em>
          </button>
          {cats.map((c) => (
            <button type="button" key={c} className={`kh-chip${cat === c ? ' is-on' : ''}`} onClick={() => setCat(cat === c ? null : c)}>
              {CATEGORIAS[c][lang] ?? CATEGORIAS[c].es} <em>{COCINA.filter((it) => it.cat === c).length}</em>
            </button>
          ))}
        </div>
      )}

      <div className="kh-grid">
        {items.map((it, i) => {
          const [name, desc] = it[lang] ?? it.es;
          const c = CATEGORIAS[it.cat];
          return (
            <a key={it.asin} className="kh-card qf-rv qf-spot" style={{ '--i': i % 4 }} href={amazonUrl(it)} target="_blank" rel="sponsored nofollow noopener">
              <span className="kh-media" style={{ '--kh-tint': c?.tint }}>
                {it.img
                  ? <img className="kh-obj" src={it.img} alt="" width="120" height="120" loading="lazy" />
                  : <span className="kh-emoji kh-obj" aria-hidden="true">{it.emoji}</span>}
                {c && <span className="kh-cat">{c[lang] ?? c.es}</span>}
              </span>
              <span className="kh-body">
                <span className="kh-name">{name}</span>
                <span className="kh-desc">{desc}</span>
                <span className="kh-cta">{t.cta} <Icon.arrow width="13" height="13" /></span>
              </span>
            </a>
          );
        })}
      </div>

      {!full && (
        <p className="kh-more"><a href={t.href}>{t.all} <Icon.arrow width="15" height="15" /></a></p>
      )}
      <p className="kh-disclosure">{t.disclosure}</p>
    </section>
  );
}
