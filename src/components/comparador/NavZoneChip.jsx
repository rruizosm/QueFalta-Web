import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './ui.jsx';

// Código postal en el navbar, junto al logo (#qf-nav-slot de SiteNav), en
// móvil y tableta (≤1120 px, cuando el navbar va con hamburguesa). Lo usan la
// ficha de producto y el catálogo de cada súper. Si no cabe entero, el CSS
// (container query «qfslot») deja solo el código postal y el botón.

/** El hueco del navbar si toca usarlo (móvil/tableta); si no, null. */
export function useNavSlot() {
  const [slot, setSlot] = useState(null);
  useEffect(() => {
    const el = document.getElementById('qf-nav-slot');
    if (!el) return undefined;
    const mq = window.matchMedia('(max-width: 1120px)');
    const on = () => setSlot(mq.matches ? el : null);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return slot;
}

/**
 * slot   — elemento de useNavSlot()
 * pre    — texto antes del CP («Precio para »); se oculta si no cabe
 * cp     — código postal a destacar (o null: solo la región)
 * region — región («Cataluña»); se oculta si no cabe y hay CP
 * title  — texto completo (tooltip y lector de pantalla)
 * edit   — texto del botón («Cambiar», «Mi zona»)
 */
export default function NavZoneChip({ slot, pre, cp, region, title, edit, onEdit }) {
  if (!slot) return null;
  return createPortal(
    <button type="button" className="cmp-navzone" onClick={onEdit} title={title} aria-label={`${title}. ${edit}`}>
      <Icon.pin width="14" height="14" />
      <span className="cmp-navzone-text">
        {cp ? (
          <>
            {pre && <span className="cmp-navzone-pre">{pre}</span>}
            <strong>{cp}</strong>
            {region && <span className="cmp-navzone-region"> · {region}</span>}
          </>
        ) : region}
      </span>
      <span className="cmp-zone-chip-edit">{edit}</span>
    </button>,
    slot,
  );
}
