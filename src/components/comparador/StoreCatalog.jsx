import { useEffect, useState } from 'react';
import { REFERENCE_CP, storesForPostalCode } from '../../data/comparadorZonas.js';
import StoreBrowser from './StoreBrowser.jsx';
import PostalModal, { readCp, saveCp } from './PostalModal.jsx';
import { LangProvider } from './i18n.jsx';

// Catálogo de un súper incrustado en su página /supermercados/{slug}/: quien
// llega desde Google buscando «catálogo Bonpreu» u «ofertas Mercadona» ve los
// productos nada más entrar, y el texto informativo queda debajo.
// Misma vista que /?super=…, pero la categoría (?cat=…&ofertas=1) va en la URL
// de esta página.

function readRoute() {
  const q = new URLSearchParams(window.location.search);
  return { cat: q.get('cat'), offers: q.get('ofertas') === '1' };
}

function Catalog({ storeKey, heading }) {
  const [ready, setReady] = useState(false);
  const [cp, setCp] = useState(null);
  const [editingCp, setEditingCp] = useState(false);
  const [route, setRoute] = useState({ cat: null, offers: false });

  useEffect(() => {
    setCp(readCp());
    setRoute(readRoute());
    setReady(true);
    const onPop = () => setRoute(readRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Con un CP donde la cadena no opera se enseñan los precios de su zona de
  // referencia (igual que sin CP): aquí se ha venido a ver este súper.
  const inZone = !!cp && storesForPostalCode(cp).some((s) => s.key === storeKey);
  const storeCp = !ready ? null : inZone ? cp : REFERENCE_CP[storeKey];

  useEffect(() => {
    document.documentElement.classList.toggle('cmp-locked', editingCp);
    return () => document.documentElement.classList.remove('cmp-locked');
  }, [editingCp]);

  const onCategory = (cat, offers = route.offers) => {
    const q = new URLSearchParams();
    if (cat) q.set('cat', cat);
    if (offers) q.set('ofertas', '1');
    const search = q.toString();
    window.history.pushState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
    setRoute({ cat, offers });
  };

  return (
    <div className="cmp cmp-embedded" id="catalogo">
      <StoreBrowser
        storeKey={storeKey}
        heading={heading}
        categoryId={route.cat}
        offersOnly={route.offers}
        cp={storeCp}
        referenceZone={!inZone}
        onBack={() => { window.location.href = '/'; }}
        onCategory={onCategory}
        onEditZone={() => setEditingCp(true)}
      />
      {editingCp && (
        <PostalModal
          initial={cp}
          canClose
          onSave={(value) => { saveCp(value); setCp(value); setEditingCp(false); }}
          onClose={() => setEditingCp(false)}
        />
      )}
    </div>
  );
}

export default function StoreCatalog({ storeKey, heading, lang = 'es' }) {
  return <LangProvider lang={lang}><Catalog storeKey={storeKey} heading={heading} /></LangProvider>;
}
