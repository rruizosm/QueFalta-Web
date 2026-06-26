// Landing.jsx — landing de marketing de QuéFalta (isla React).
// Dirección visual: "Apple minimal claro" — mucho blanco, tipografía rotunda,
// secciones full-width alternas y un recorrido claro de "cómo se usa la app".
// Reutiliza los mockups de pantallas de la app (tema "Mercado Fresco") como
// placeholders sustituibles por capturas reales más adelante.
import React from 'react';
const { useState, useEffect, useRef } = React;

import { PHONE_THEME, ThemeCtx, Icon, hexA } from '../phone/theme.jsx';
import { Phone } from '../phone/frame.jsx';
import { HomeScreen } from '../phone/screens/Home.jsx';
import { CatalogScreen } from '../phone/screens/Catalog.jsx';
import { ProductsScreen } from '../phone/screens/Products.jsx';
import { ListScreen } from '../phone/screens/List.jsx';
import { GroupsScreen } from '../phone/screens/Groups.jsx';
import { GroupDetailScreen } from '../phone/screens/GroupDetail.jsx';

// Sustituir por la URL real de la ficha en la App Store cuando exista.
const APP_STORE_URL = '#';

// ── Datos de la página ─────────────────────────────────────────
const STEPS = [
  {
    n: '1', title: 'Crea tu grupo',
    desc: 'Tu casa, el piso compartido o la cena del finde. Invita a quien quieras con un solo enlace.',
  },
  {
    n: '2', title: 'Añadid lo que falta',
    desc: 'Cada uno suma productos del catálogo de su supermercado favorito. La lista es de todos y se actualiza al momento.',
  },
  {
    n: '3', title: 'Comprad sin líos',
    desc: 'Marcad lo que vais incluyendo en el carrito. Todos veis qué falta, en tiempo real.',
  },
];

const ROWS = [
  {
    eyebrow: 'Catálogo', tab: 'catalog', Screen: CatalogScreen,
    img: '/mock/catalog.png', alt: 'Catálogo de productos de Mercadona en QuéFalta',
    title: 'Un catálogo de verdad, no una hoja en blanco',
    desc: 'Olvídate de escribir la lista a mano. Busca entre miles de productos reales de tu supermercado y añádelos con un toque.',
    bullets: ['6 supermercados dentro de la app', 'Busca entre miles de productos por supermercado', 'Categorías claras y ordenadas'],
  },
  {
    eyebrow: 'Productos', tab: 'catalog', Screen: ProductsScreen,
    img: '/mock/catalog_3.png', alt: 'Añadir productos a la lista ajustando cantidades en QuéFalta',
    title: 'Añade con un solo toque',
    desc: 'Dentro de cada categoría sumas productos a la lista y ajustas las cantidades sin perder de vista el precio.',
    bullets: ['Selector de cantidad por producto', 'Precio y formato siempre visibles', 'Resumen de lo que llevas seleccionado'],
  },
  {
    eyebrow: 'Tu lista', tab: 'list', Screen: ListScreen,
    img: '/mock/cesta.PNG', alt: 'Lista de la compra del grupo con artículos por recoger y en la cesta en QuéFalta',
    title: 'Marca lo que ya tienes',
    desc: 'La lista separa lo que falta por coger de lo que ya está en la cesta, con el total estimado siempre actualizado.',
    bullets: ['«Por recoger» frente a «En cesta»', 'Total estimado en vivo', 'Ordenada por las categorias del supermercado para no perder tiempo'],
  },
  {
    eyebrow: 'Grupos', tab: 'groups', Screen: GroupsScreen,
    img: '/mock/groups.PNG', alt: 'Tus grupos de compra con el carrito activo en QuéFalta',
    title: 'Una lista, todo tu grupo',
    desc: 'Crea grupos para casa, una fiesta o la oficina y decide qué carrito está activo en cada momento.',
    bullets: ['Listas compartidas con todo el grupo', 'Miembros con su avatar y su rol', 'Cambia de carrito al instante'],
  },
];

const SUPERS = [
  { name: 'Mercadona', logo: '/stores/mercadona.png' },
  { name: 'Carrefour', logo: '/stores/carrefour.png' },
  { name: 'Consum', logo: '/stores/consum.png' },
  { name: 'Dia', logo: '/stores/dia.png' },
  { name: 'Bonpreu i Esclat', logo: '/stores/bonpreuesclat.png' },
  { name: 'bonÀrea', logo: '/stores/bonarea.png' },
];

const EXTRAS = [
  { icon: 'share', title: 'Invita con un enlace', desc: 'Compartes un enlace y tu gente entra directa al grupo. Sin códigos ni fricción.' },
  { icon: 'list', title: 'Ordenada por el súper', desc: 'La lista se agrupa por zonas del supermercado para que no des vueltas entre pasillos.' },
  { icon: 'at', title: 'Tu @usuario', desc: 'Elige tu @, tu foto y deja que tus amigos te encuentren para sumar a sus grupos.' },
  { icon: 'bell', title: 'Notificaciones', desc: 'Entérate de lo que pasa en tus grupos, con los avisos ajustados a tu gusto.' },
];

// Avisos de ejemplo para la sección «Notificaciones».
const NOTIFS = [
  { icon: 'cart', tint: '#2f6cb5', title: 'Marta ha añadido Leche entera a la cesta', time: 'ahora' },
  { icon: 'users', tint: '#3fa078', title: 'Te han añadido al grupo «Piso Centro»', time: '2 min' },
  { icon: 'userPlus', tint: '#7c5cd6', title: 'Carlos te ha enviado una solicitud de amistad', time: '5 min' },
];

// Amigos de ejemplo para la sección «Amigos».
const FRIENDS = [
  { initials: 'MG', color: '#df4b2e', name: 'Marta García', user: '@marta' },
  { initials: 'CL', color: '#3fa078', name: 'Carlos López', user: '@carlos' },
  { initials: 'AV', color: '#7c5cd6', name: 'Ana Vidal', user: '@anav' },
];

// Colores de acento disponibles en «Preferencias».
const PREF_COLORS = ['#2f6cb5', '#3fa078', '#7c5cd6', '#df4b2e', '#e0608f', '#1f9bb3', '#e6a23c'];

// ── Hooks ──────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in');
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Primitivas ─────────────────────────────────────────────────
function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`qf-reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}

function AppleBadge({ light }) {
  return (
    <a href={APP_STORE_URL} aria-label="Descárgalo en el App Store" className={`qf-badge ${light ? 'light' : ''}`}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.78 1.3 10.33.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.93-.03-.01-2.7-1.04-2.73-4.09z M14.7 4.7c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z" />
      </svg>
      <span className="qf-badge-txt"><small>Descárgalo en el</small><strong>App Store</strong></span>
    </a>
  );
}

function PhoneRender({ f }) {
  return (
    <div className="qf-phone-scale">
      {f.img ? (
        <Phone image={f.img} alt={f.alt} eager={f.eager} />
      ) : (
        <Phone tab={f.tab} noNav={f.noNav}>{React.createElement(f.Screen)}</Phone>
      )}
    </div>
  );
}

// ── Secciones ──────────────────────────────────────────────────
function Hero() {
  return (
    <header className="qf-hero" id="top">
      <div className="qf-hero-bg" aria-hidden="true" />
      <Reveal>
        <span className="qf-pill"><span className="qf-dot" />Disponible para iPhone</span>
      </Reveal>
      <Reveal as="h1" className="qf-display qf-hero-title" delay={60}>
        <span className="qf-em">QuéFalta</span> en tu lista de la compra?
      </Reveal>
      <Reveal as="p" className="qf-lead qf-hero-lead" delay={120}>
        La lista de la compra compartida para tu hogar, tu grupo de amigos o la oficina. Añade los productos de tus supermercados favoritos.
        Marca lo que ya has cogido. Imágenes y precios reales. Todo en una sola app.
      </Reveal>
      <Reveal as="p" className="qf-hero-sub" delay={160}>
        En la app encontrarás <strong>todos los productos</strong> de los supermercados incluidos, listos para añadir a tu lista.
      </Reveal>
      <Reveal className="qf-hero-logos" delay={170} aria-label="Supermercados incluidos">
        {SUPERS.map((s) => (
          <span key={s.name} className="qf-hero-logo" title={s.name}>
            <img src={s.logo} alt={s.name} width="24" height="24" loading="lazy" />
          </span>
        ))}
      </Reveal>
      <Reveal delay={180}>
        <div className="qf-hero-actions">
          <AppleBadge />
          <a href="#como-funciona" className="qf-ghost">
            Cómo funciona
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
          </a>
        </div>
      </Reveal>
      <Reveal className="qf-hero-stage" delay={140}>
        <div className="qf-hero-phone"><PhoneRender f={{ tab: 'home', Screen: HomeScreen, img: '/mock/home.png', alt: 'Pantalla de inicio de QuéFalta con el carrito activo y los grupos', eager: true }} /></div>
      </Reveal>
    </header>
  );
}

function HowItWorks() {
  return (
    <section className="qf-section alt" id="como-funciona">
      <div className="qf-wrap">
        <div className="qf-section-head">
          <Reveal as="span" className="qf-eyebrow">Cómo funciona</Reveal>
          <Reveal as="h2" className="qf-display qf-section-title" delay={60}>Empezar lleva un minuto.</Reveal>
          <Reveal as="p" className="qf-lead qf-section-lead" delay={120}>
            Tres pasos y ya puedes empezar a compartir tu lista de la compra. Sin manuales, sin configurar nada raro.
          </Reveal>
        </div>
        <div className="qf-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} className="qf-step" delay={i * 90}>
              <span className="qf-step-num">{s.n}</span>
              <h3 className="qf-step-title">{s.title}</h3>
              <p className="qf-step-desc">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <span className="qf-step-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ f, flip }) {
  return (
    <div className={`qf-row ${flip ? 'flip' : ''}`}>
      <Reveal className="qf-row-copy">
        <span className="qf-eyebrow">{f.eyebrow}</span>
        <h2 className="qf-row-title">{f.title}</h2>
        <p className="qf-row-desc">{f.desc}</p>
        <ul className="qf-bullets">
          {f.bullets.map((b) => (
            <li key={b}><span className="qf-check"><Icon name="check" size={13} color="#fff" stroke={2.6} /></span>{b}</li>
          ))}
        </ul>
      </Reveal>
      <Reveal className="qf-row-media" delay={80}>
        <div className="qf-stage"><PhoneRender f={f} /></div>
      </Reveal>
    </div>
  );
}

function Features() {
  return (
    <div className="qf-rows" id="funciones">
      {ROWS.map((f, i) => (
        <section key={f.eyebrow} className={i % 2 === 1 ? 'qf-rowband alt' : 'qf-rowband'}>
          <FeatureRow f={f} flip={i % 2 === 1} />
        </section>
      ))}
    </div>
  );
}

// ── Ilustraciones de las secciones extra ───────────────────────
function NotifVisual() {
  return (
    <div className="qf-notif-stack" aria-hidden="true">
      {NOTIFS.map((n) => (
        <div key={n.title} className="qf-notif">
          <span className="qf-notif-ic" style={{ background: hexA(n.tint, 0.12) }}>
            <Icon name={n.icon} size={18} color={n.tint} />
          </span>
          <span className="qf-notif-txt">{n.title}</span>
          <span className="qf-notif-time">{n.time}</span>
        </div>
      ))}
    </div>
  );
}

function FriendsVisual() {
  return (
    <div className="qf-friends-card" aria-hidden="true">
      <div className="qf-friends-head">
        <span className="qf-friends-title">Compartir «Casa»</span>
        <span className="qf-friends-badge"><Icon name="share" size={14} color="var(--accent)" /></span>
      </div>
      <div className="qf-friends-search">
        <Icon name="at" size={15} color="var(--ink-faint)" />
        <span>Busca por @usuario…</span>
      </div>
      {FRIENDS.map((fr) => (
        <div key={fr.user} className="qf-friend">
          <span className="qf-friend-av" style={{ background: fr.color }}>{fr.initials}</span>
          <span className="qf-friend-meta">
            <span className="qf-friend-name">{fr.name}</span>
            <span className="qf-friend-user">{fr.user}</span>
          </span>
          <span className="qf-friend-add"><Icon name="plus" size={15} color="#fff" stroke={2.4} /></span>
        </div>
      ))}
    </div>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

// Aplica el color de acento a toda la web (vars en <html>).
function applyAccent(hex) {
  const n = parseInt(hex.slice(1), 16);
  const rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  const el = document.documentElement;
  el.style.setProperty('--accent', hex);
  el.style.setProperty('--accent-soft', `rgba(${rgb},0.14)`);
  el.style.setProperty('--accent-light', `rgba(${rgb},0.10)`);
}

// Activa el modo claro/oscuro en toda la web.
function applyTheme(mode) {
  if (mode === 'dark') document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
}

function PrefVisual() {
  const [mode, setMode] = useState('light');
  const [accent, setAccent] = useState(PREF_COLORS[0]);

  // Sincroniza el selector con lo que el script del Layout ya aplicó.
  useEffect(() => {
    try {
      const t = localStorage.getItem('qf-theme');
      if (t === 'dark' || t === 'light') setMode(t);
      const a = localStorage.getItem('qf-accent');
      if (a) setAccent(a);
    } catch (e) { /* sin almacenamiento: usa valores por defecto */ }
  }, []);

  const chooseMode = (m) => {
    setMode(m);
    applyTheme(m);
    try { localStorage.setItem('qf-theme', m); } catch (e) { /* noop */ }
  };
  const chooseAccent = (c) => {
    setAccent(c);
    applyAccent(c);
    try { localStorage.setItem('qf-accent', c); } catch (e) { /* noop */ }
  };

  return (
    <div className="qf-pref-card">
      <div className="qf-pref-block">
        <span className="qf-pref-label">Apariencia</span>
        <div className="qf-pref-modes">
          <button type="button" className={`qf-pref-mode${mode === 'light' ? ' is-on' : ''}`} aria-pressed={mode === 'light'} onClick={() => chooseMode('light')}>
            <SunIcon />Claro
          </button>
          <button type="button" className={`qf-pref-mode${mode === 'dark' ? ' is-on' : ''}`} aria-pressed={mode === 'dark'} onClick={() => chooseMode('dark')}>
            <Icon name="moon" size={15} color="currentColor" />Noche
          </button>
        </div>
      </div>
      <div className="qf-pref-block">
        <span className="qf-pref-label">Color de acento</span>
        <div className="qf-pref-colors">
          {PREF_COLORS.map((c) => (
            <button
              type="button" key={c} className={`qf-pref-dot${accent === c ? ' is-on' : ''}`}
              style={{ background: c }} aria-label={`Usar el color ${c}`} aria-pressed={accent === c}
              onClick={() => chooseAccent(c)}
            >
              {accent === c && <Icon name="check" size={15} color="#fff" stroke={2.6} />}
            </button>
          ))}
        </div>
      </div>
      <div className="qf-pref-block">
        <span className="qf-pref-label">Idioma</span>
        <div className="qf-pref-langs">
          <span className="qf-pref-lang is-on">Español</span>
          <span className="qf-pref-lang">Català</span>
        </div>
      </div>
    </div>
  );
}

function ExtraRow({ id, alt, flip, eyebrow, title, desc, bullets, children }) {
  return (
    <section id={id} className={alt ? 'qf-rowband alt' : 'qf-rowband'}>
      <div className={`qf-row ${flip ? 'flip' : ''}`}>
        <Reveal className="qf-row-copy">
          <span className="qf-eyebrow">{eyebrow}</span>
          <h2 className="qf-row-title">{title}</h2>
          <p className="qf-row-desc">{desc}</p>
          <ul className="qf-bullets">
            {bullets.map((b) => (
              <li key={b}><span className="qf-check"><Icon name="check" size={13} color="#fff" stroke={2.6} /></span>{b}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="qf-row-media" delay={80}>{children}</Reveal>
      </div>
    </section>
  );
}

function MoreFeatures() {
  return (
    <>
      <ExtraRow
        id="notificaciones" eyebrow="Notificaciones" title="No te pierdas nada importante"
        desc="Activa las notificaciones y QuéFalta te avisa justo cuando algo cambia en tus grupos, sin tener que estar abriendo la app."
        bullets={['Cuando alguien añade un producto a la cesta', 'Cuando te añaden a un grupo nuevo', 'Cuando recibes una solicitud de amistad']}
      >
        <NotifVisual />
      </ExtraRow>
      <ExtraRow
        id="amigos" alt flip eyebrow="Amigos" title="Comparte con tu gente, sin rodeos"
        desc="Añade a tus amigos, compañeros de trabajo o familia y comparte tus grupos directamente con ellos."
        bullets={['Encuéntralos por su @usuario', 'Comparte cualquier grupo con un toque', 'Amigos, familia o compañeros de oficina']}
      >
        <FriendsVisual />
      </ExtraRow>
      <ExtraRow
        id="preferencias" eyebrow="Preferencias" title="Haz que la app sea tuya"
        desc="Ajusta QuéFalta a tu gusto: elige los supermercados que quieres ver, cambia la apariencia y úsala en tu idioma."
        bullets={['Elige tus supermercados favoritos: solo esos aparecen en tu catálogo', 'Modo claro u oscuro y 7 colores de acento', 'Interfaz en català, con el catálogo de Mercadona, BonPreu Esclat i bonÀrea']}
      >
        <PrefVisual />
      </ExtraRow>
    </>
  );
}

function RealtimeBand() {
  return (
    <section className="qf-band">
      <div className="qf-band-grid">
        <Reveal>
          <span className="qf-eyebrow">En equipo</span>
          <h2 className="qf-band-title">Cada cambio, al instante.</h2>
          <p className="qf-band-desc">
            Cuando alguien añade o recoge un producto, todo el grupo lo ve al momento. Se acabaron los chats
            infinitos preguntando «¿compraste el pan?».
          </p>
          <div className="qf-stats">
            <div className="qf-stat"><div className="qf-stat-k">Tiempo real</div><div className="qf-stat-l">Listas sincronizadas al segundo</div></div>
            <div className="qf-stat"><div className="qf-stat-k">0 chats</div><div className="qf-stat-l">Todo vive en la lista</div></div>
          </div>
        </Reveal>
        <Reveal className="qf-band-media" delay={100}>
          <div className="qf-stage"><PhoneRender f={{ Screen: GroupDetailScreen, noNav: true, img: '/mock/groups_2.PNG', alt: 'Detalle de un grupo con la cesta compartida y los miembros en QuéFalta' }} /></div>
        </Reveal>
      </div>
    </section>
  );
}

function Supermarkets() {
  return (
    <section className="qf-section">
      <div className="qf-wrap">
        <div className="qf-section-head">
          <Reveal as="span" className="qf-eyebrow">Catálogo real</Reveal>
          <Reveal as="h2" className="qf-display qf-section-title" delay={60}>Tus súper favoritos, en una sola app.</Reveal>
          <Reveal as="p" className="qf-lead qf-section-lead" delay={120}>
            Consulta productos y precios de los principales supermercados de España sin saltar de una app a otra.
          </Reveal>
        </div>
        <Reveal className="qf-supers" delay={120}>
          {SUPERS.map((s) => (
            <span key={s.name} className="qf-super">
              <img className="qf-super-logo" src={s.logo} alt="" width="24" height="24" loading="lazy" />
              {s.name}
            </span>
          ))}
        </Reveal>
        <Reveal as="p" className="qf-disclaimer" delay={160}>
          Los precios son orientativos y pueden variar. QuéFalta no está afiliada, asociada ni patrocinada por
          ninguno de estos supermercados.
        </Reveal>
      </div>
    </section>
  );
}

function Extras() {
  return (
    <section className="qf-section alt">
      <div className="qf-wrap">
        <div className="qf-section-head">
          <Reveal as="span" className="qf-eyebrow">Y además</Reveal>
          <Reveal as="h2" className="qf-display qf-section-title" delay={60}>Pensada para el día a día.</Reveal>
        </div>
        <div className="qf-extras">
          {EXTRAS.map((e, i) => (
            <Reveal key={e.title} className="qf-extra" delay={i * 70}>
              <div className="qf-extra-ic"><Icon name={e.icon} size={22} color="var(--accent)" /></div>
              <h3 className="qf-extra-title">{e.title}</h3>
              <p className="qf-extra-desc">{e.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DownloadCTA() {
  return (
    <section className="qf-cta" id="descargar">
      <div className="qf-cta-bg" aria-hidden="true" />
      <Reveal>
        <div className="qf-cta-word">Qué<span>Falta</span></div>
        <h2 className="qf-display qf-cta-title">Que no se te olvide <span className="qf-em">nada</span>.</h2>
        <p className="qf-lead qf-cta-lead">Descarga QuéFalta y empieza a compartir la compra con tu gente hoy mismo.</p>
        <div className="qf-cta-actions"><AppleBadge /></div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="qf-footer">
      <div className="qf-footer-inner">
        <a href="#top" className="qf-footer-brand">
          <img src="/quefalta-logo-blue.png" alt="" className="qf-footer-logo" width="24" height="24" />
          <span className="qf-footer-word">Qué<span>Falta</span></span>
        </a>
        <nav className="qf-footer-links">
          <a href="/novedades">Novedades</a>
          <a href="/apoyar">Apoyar</a>
          <a href="/privacidad">Privacidad</a>
          <a href="/condiciones">Condiciones</a>
          <a href="/cookies">Cookies</a>
          <a href="mailto:contacto@quefalta.es">Contacto</a>
        </nav>
        <p className="qf-footer-copy">© {new Date().getFullYear()} QuéFalta · Hecho en España</p>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <ThemeCtx.Provider value={PHONE_THEME}>
      <div className="qf">
        <Hero />
        <HowItWorks />
        <Features />
        <MoreFeatures />
        <RealtimeBand />
        <Supermarkets />
        <Extras />
        <DownloadCTA />
        <Footer />
      </div>
    </ThemeCtx.Provider>
  );
}
