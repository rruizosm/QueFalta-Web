import { useEffect, useState } from 'react';
import { parseProductPath } from '../../lib/productoApi.js';
import ProductPage from './ProductPage.jsx';

// Fichas desde la página 404. Solo se generan en HTML unas 3.000 fichas; el
// resto de /producto/<súper>/<id>/ no tiene fichero, así que el servidor
// (Amplify, `astro dev`, `astro preview`) responde con el 404. Aquí se
// reconoce la ruta de ficha y se pinta la ficha en su lugar, sin depender de
// ninguna regla de reescritura. En cualquier otra ruta no pinta nada.
export default function ProductFallback() {
  const [lang, setLang] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (parseProductPath(path)) setLang(path.startsWith('/ca/') ? 'ca' : 'es');
  }, []);

  return lang ? <ProductPage lang={lang} /> : null;
}
