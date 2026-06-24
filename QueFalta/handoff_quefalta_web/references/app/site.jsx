// site.jsx — QueFalta marketing landing (reuses the Mercado Fresco app screens).
const { useState, useEffect, useRef } = React;

const FRESCO_BASE = THEMES.find((t) => t.id === 'fresco');
const PHONE_THEME = resolveTheme(FRESCO_BASE, TWEAK_DEFAULTS);

// ── Features: one phone screen per scroll block ───────────────
const FEATURES = [
  {
    num: '01', tab: 'home', Screen: HomeScreen,
    eyebrow: 'Inicio',
    title: 'Toda tu compra, de un vistazo',
    desc: 'Al abrir QueFalta ves lo que importa: el carrito activo de tu hogar, cuánto lleváis recogido y lo que aún falta por coger.',
    bullets: [
      'Progreso del carrito compartido en tiempo real',
      'Accesos rápidos al catálogo por categorías',
      'Tus grupos, siempre a un toque',
    ],
  },
  {
    num: '02', tab: 'catalog', Screen: CatalogScreen,
    eyebrow: 'Catálogo',
    title: 'Encuentra cualquier producto',
    desc: 'Explora un catálogo ordenado por categorías y subcategorías, o busca directamente lo que necesitas sin dar vueltas.',
    bullets: [
      'Categorías claras con su número de subcategorías',
      'Buscador instantáneo mientras escribes',
      'Cambia entre vista de categorías y productos',
    ],
  },
  {
    num: '03', tab: 'catalog', Screen: ProductsScreen,
    eyebrow: 'Productos',
    title: 'Añade con un solo toque',
    desc: 'Dentro de cada subcategoría sumas productos a la lista y ajustas las cantidades sin perder de vista el precio.',
    bullets: [
      'Selector de cantidad por producto',
      'Precio y formato siempre visibles',
      'Resumen de lo que llevas seleccionado',
    ],
  },
  {
    num: '04', tab: 'list', Screen: ListScreen,
    eyebrow: 'Mi Lista',
    title: 'Marca lo que ya tienes',
    desc: 'La lista de la compra de tu grupo, dividida entre lo que falta por recoger y lo que ya está en la cesta.',
    bullets: [
      'Marca artículos como recogidos al instante',
      'Total estimado siempre actualizado',
      'Separa “por recoger” de “en la cesta”',
    ],
  },
  {
    num: '05', tab: 'groups', Screen: GroupsScreen,
    eyebrow: 'Grupos',
    title: 'Comparte la compra con los tuyos',
    desc: 'Crea grupos para casa, una fiesta o la oficina y decide en cada momento qué carrito está activo.',
    bullets: [
      'Listas compartidas con todo el grupo',
      'Miembros con su avatar y su rol',
      'Activa el carrito del grupo que quieras',
    ],
  },
  {
    num: '06', tab: null, Screen: GroupDetailScreen, noNav: true,
    eyebrow: 'En equipo',
    title: 'Cada cambio, al instante',
    desc: 'Cuando alguien añade o recoge un producto, todo el grupo lo ve al momento. Sin grupos de chat infinitos.',
    bullets: [
      'Cesta común con el estado de cada artículo',
      'Total compartido del grupo',
      'Comparte e invita con un enlace',
    ],
  },
  {
    num: '07', tab: null, Screen: ProfileScreen, noNav: true,
    eyebrow: 'Tu perfil',
    title: 'Tuyo, con tu @usuario',
    desc: 'Tu identidad en QueFalta: elige tu @, tu foto y gestiona notificaciones y preferencias de tus grupos.',
    bullets: [
      '@usuario único para que te encuentren',
      'Foto de perfil personalizable',
      'Notificaciones y preferencias a tu gusto',
    ],
  },
];

function AppleBadge({ large }) {
  return (
    <a href="#" onClick={(e) => e.preventDefault()} className="qf-badge" style={large ? { transform: 'scale(1.0)' } : {}}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.78 1.3 10.33.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.93-.03-.01-2.7-1.04-2.73-4.09z M14.7 4.7c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z"/>
      </svg>
      <span className="qf-badge-txt"><small>Descárgalo en el</small><strong>App Store</strong></span>
    </a>
  );
}

function PhoneRender({ f }) {
  return <Phone tab={f.tab} noNav={f.noNav}>{React.createElement(f.Screen)}</Phone>;
}

function SiteNav() {
  return (
    <nav className="qf-nav">
      <div className="qf-nav-inner">
        <div className="qf-word">Que<span>Falta</span></div>
        <div className="qf-nav-right">
          <a href="#features" className="qf-nav-link">Funciones</a>
          <a href="#descargar" className="qf-nav-cta">Descargar</a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="qf-hero">
      <div className="qf-hero-grid">
        <div className="qf-hero-copy">
          <div className="qf-pill"><span className="qf-dot" />Disponible para iPhone</div>
          <h1 className="qf-hero-title">Sabes siempre<br /><em>qué falta</em> en casa.</h1>
          <p className="qf-hero-desc">
            QueFalta es la lista de la compra compartida para tu hogar, tu grupo de amigos o la oficina.
            Añade, reparte y marca lo que ya tienes — todos a la vez, en tiempo real.
          </p>
          <div className="qf-hero-actions">
            <AppleBadge large />
            <span className="qf-hero-meta">iOS 16+ · Gratis</span>
          </div>
        </div>
        <div className="qf-hero-phone">
          <div className="qf-glow" />
          <div className="qf-phone-tilt"><PhoneRender f={FEATURES[0]} /></div>
        </div>
      </div>
      <a href="#features" className="qf-scrollcue">
        <span>Descubre cada pestaña</span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
      </a>
    </header>
  );
}

function Showcase() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(Number(en.target.dataset.idx));
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const f = FEATURES[active];
  return (
    <section className="qf-showcase" id="features">
      <div className="qf-showcase-grid">
        <div className="qf-features">
          {FEATURES.map((feat, i) => (
            <article
              key={feat.num}
              data-idx={i}
              ref={(el) => (refs.current[i] = el)}
              className={`qf-feature ${i === active ? 'is-active' : ''}`}
            >
              <div className="qf-feature-eyebrow"><span className="qf-num">{feat.num}</span>{feat.eyebrow}</div>
              <h2 className="qf-feature-title">{feat.title}</h2>
              <p className="qf-feature-desc">{feat.desc}</p>
              <ul className="qf-bullets">
                {feat.bullets.map((b) => (
                  <li key={b}>
                    <span className="qf-check"><Icon name="check" size={13} color="#fff" stroke={2.6} /></span>
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="qf-phone-col">
          <div className="qf-phone-sticky">
            <div className="qf-phone-frame">
              <div key={active} className="qf-screen-fade"><PhoneRender f={f} /></div>
            </div>
            <div className="qf-phone-label">
              <span className="qf-label-name">{f.eyebrow}</span>
              <span className="qf-label-count">{f.num} / 07</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="qf-cta" id="descargar">
      <div className="qf-cta-inner">
        <div className="qf-word qf-word-lg">Que<span>Falta</span></div>
        <h2 className="qf-cta-title">Que no se te olvide nada.</h2>
        <p className="qf-cta-desc">Descarga QueFalta y empieza a compartir la compra con tu gente hoy mismo.</p>
        <div className="qf-cta-actions"><AppleBadge large /></div>
        <div className="qf-foot">
          <span>© 2026 QueFalta</span>
          <span className="qf-foot-links"><a href="#">Privacidad</a><a href="#">Términos</a><a href="#">Contacto</a></span>
        </div>
      </div>
    </section>
  );
}

function Progress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setP(h.scrollTop / (h.scrollHeight - h.clientHeight || 1));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="qf-progress" style={{ transform: `scaleX(${p})` }} />;
}

function Landing() {
  return (
    <ThemeCtx.Provider value={PHONE_THEME}>
      <Progress />
      <SiteNav />
      <Hero />
      <Showcase />
      <CTA />
    </ThemeCtx.Provider>
  );
}

Object.assign(window, { Landing });
