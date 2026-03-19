'use client';

import { useState } from 'react';
import s from './landing.module.css';

const FORMSPREE = 'https://formspree.io/f/xojnpnzy';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function PilotForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={s.pilotFormWrap}>
        <div className={s.formSuccess}>
          <div className={s.formSuccessIcon}>✓</div>
          <p>Request sent. We&apos;ll reply within 24–48 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.pilotFormWrap}>
      <form className={s.pilotForm} onSubmit={handleSubmit} noValidate>
        <div className={s.formRow}>
          <div className={s.formField}>
            <label className={s.formLabel}>Your name *</label>
            <input className={s.formInput} type="text" name="name" required placeholder="Jane Smith" />
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>Store name *</label>
            <input className={s.formInput} type="text" name="store_name" required placeholder="Clear Vision Optics" />
          </div>
        </div>
        <div className={s.formRow}>
          <div className={s.formField}>
            <label className={s.formLabel}>City *</label>
            <input className={s.formInput} type="text" name="city" required placeholder="Kathmandu" />
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>Email *</label>
            <input className={s.formInput} type="email" name="email" required placeholder="jane@store.com" />
          </div>
        </div>
        <div className={s.formField}>
          <label className={s.formLabel}>
            Phone <span className={s.formOptional}>(optional)</span>
          </label>
          <input className={s.formInput} type="tel" name="phone" placeholder="+1 555 000 0000" />
        </div>
        <div className={s.formField}>
          <label className={s.formLabel}>
            Message <span className={s.formOptional}>(optional)</span>
          </label>
          <textarea className={`${s.formInput} ${s.formTextarea}`} name="message" rows={3} placeholder="Any questions or context..." />
        </div>
        {status === 'error' && (
          <p className={s.formError}>Something went wrong. Please try again.</p>
        )}
        <button type="submit" className={s.formSubmit} disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending…' : 'Request Pilot'}
        </button>
      </form>
    </div>
  );
}
