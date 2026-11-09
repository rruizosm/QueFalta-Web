import { useEffect, useRef, useState } from 'react';
import { regionFromPostalCode, storesForPostalCode } from '../../data/comparadorZonas.js';
import { Icon } from './ui.jsx';
import { useT } from './i18n.jsx';

// Modal de código postal del comparador y de las fichas de producto. El CP se
// recuerda en este navegador (`qf-cp`).

const CP_KEY = 'qf-cp';

export function readCp() {
  try {
    const v = localStorage.getItem(CP_KEY);
    return v && regionFromPostalCode(v) ? v : null;
  } catch {
    return null;
  }
}

export function saveCp(cp) {
  try { localStorage.setItem(CP_KEY, cp); } catch {}
}

/* ───────────────────── Modal de código postal ───────────────────── */

export default function PostalModal({ initial, canClose, onSave, onClose }) {
  const t = useT();
  const [cp, setCp] = useState(initial ?? '');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!canClose) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [canClose, onClose]);

  const complete = cp.length === 5;
  const region = complete ? regionFromPostalCode(cp) : null;
  const stores = region ? storesForPostalCode(cp) : [];
  const invalid = complete && !region;

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (region) onSave(cp);
  };

  return (
    <div className="cmp-modal-root" role="presentation">
      <div className="cmp-modal-backdrop" onClick={canClose ? onClose : undefined} />
      <form className="cmp-modal" role="dialog" aria-modal="true" aria-labelledby="cmp-cp-title" onSubmit={submit}>
        {canClose && (
          <button type="button" className="cmp-modal-x" onClick={onClose} aria-label={t.close}>
            <Icon.close width="18" height="18" />
          </button>
        )}
        <div className="cmp-modal-pin" aria-hidden="true">
          <span className="cmp-modal-pin-pulse" />
          <Icon.pin width="28" height="28" />
        </div>
        <h2 id="cmp-cp-title" className="cmp-modal-title">{t.cpTitle}</h2>
        <p className="cmp-modal-lead">{t.cpLead}</p>

        <label className={`cmp-otp${invalid && touched ? ' is-error' : ''}${region ? ' is-ok' : ''}`}>
          <span className="cmp-sr">{t.cpLabel}</span>
          <input
            ref={inputRef}
            className="cmp-otp-input"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={cp}
            onChange={(e) => { setCp(e.target.value.replace(/\D/g, '').slice(0, 5)); setTouched(e.target.value.length >= 5); }}
            aria-invalid={invalid}
            aria-describedby="cmp-cp-status"
          />
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`cmp-otp-box${cp[i] ? ' is-filled' : ''}${i === cp.length || (i === 4 && complete) ? ' is-caret' : ''}`}
            >
              {cp[i] ?? ''}
            </span>
          ))}
        </label>

        <div id="cmp-cp-status" className="cmp-modal-status" aria-live="polite">
          {region ? (
            <div className="cmp-zone" key={cp}>
              <div className="cmp-zone-head">
                <span className="cmp-zone-dot" />
                <strong>{t.region(region)}</strong>
                <span className="cmp-zone-count">{t.stores(stores.length)}</span>
              </div>
              <div className="cmp-zone-logos">
                {stores.map((s, i) => (
                  <span key={s.key} className="cmp-zone-logo" style={{ animationDelay: `${i * 35}ms` }} title={s.name}>
                    <img src={s.logo} alt={s.name} width="30" height="30" />
                  </span>
                ))}
              </div>
            </div>
          ) : invalid ? (
            <p className="cmp-modal-error">{t.cpInvalid}</p>
          ) : (
            <p className="cmp-modal-hint">{t.cpHint}</p>
          )}
        </div>

        <button type="submit" className="cmp-btn cmp-btn-primary cmp-modal-cta" disabled={!region}>
          {t.cpCta}
          <Icon.arrow width="18" height="18" />
        </button>
        <p className="cmp-modal-privacy">
          <Icon.lock width="13" height="13" />
          {t.cpPrivacy}
        </p>
      </form>
    </div>
  );
}
