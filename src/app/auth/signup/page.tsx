'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function SignupPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [yourName, setYourName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) return;
    if (!SUPABASE_CONFIGURED) return;
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { store_name: storeName, full_name: yourName, city } },
      });
      if (authError) { setError(authError.message); return; }
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0 0 10px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    outline: 'none',
    fontSize: 14,
    color: '#FDFAF4',
    borderRadius: 0,
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(253,250,244,0.5)',
    marginBottom: 8,
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#1A1612' }}>

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col p-12 relative overflow-hidden"
        style={{ backgroundColor: '#1A1612' }}
      >
        {/* Background ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(ellipse at center, rgba(168,132,74,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo — top left */}
        <div className="flex-shrink-0 relative z-10">
          <p className="font-serif text-2xl italic" style={{ color: '#FDFAF4' }}>
            Specta<span style={{ color: '#C9A96E' }}>Snap</span>
          </p>
        </div>

        {/* Image placeholder — optical store interior */}
        <div className="flex-1 flex items-center justify-center relative z-10" style={{ margin: '40px 0' }}>
          <div
            style={{
              width: '100%',
              maxWidth: 380,
              aspectRatio: '4/3',
              backgroundColor: '#0A0A0A',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle grid lines suggesting a store interior */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(201,169,110,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.04) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Perspective shelf lines */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, rgba(168,132,74,0.06) 0%, transparent 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '15%',
                right: '15%',
                height: 1,
                backgroundColor: 'rgba(201,169,110,0.12)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '55%',
                left: '8%',
                right: '8%',
                height: 1,
                backgroundColor: 'rgba(201,169,110,0.08)',
              }}
            />
          </div>
        </div>

        {/* Overlay text — headline + subtext */}
        <div className="relative z-10" style={{ paddingBottom: 8 }}>
          <p
            className="font-serif"
            style={{
              fontStyle: 'italic',
              fontSize: 28,
              lineHeight: 1.25,
              color: '#FDFAF4',
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            Curating the future of optical retail.
          </p>
          <p
            className="font-sans"
            style={{
              fontSize: 13,
              lineHeight: 1.65,
              color: 'rgba(253,250,244,0.45)',
              marginBottom: 32,
              maxWidth: 340,
            }}
          >
            Join the exclusive circle of digital curators. Transform your boutique into a high-fidelity virtual showroom.
          </p>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Avatar dots */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['#C9A96E', '#A8844A', '#DDD8CE'].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: '2px solid #1A1612',
                    marginLeft: i === 0 ? 0 : -8,
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
            <p
              className="font-sans"
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(253,250,244,0.35)',
              }}
            >
              Trusted by 500+ Luxury Boutiques
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        <div className="w-full max-w-sm">

          {/* Heading block */}
          <h1
            className="font-serif"
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: '#1A1612',
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            Create Account
          </h1>
          <p
            className="font-sans"
            style={{
              fontSize: 13,
              color: '#6B6560',
              marginBottom: 36,
              lineHeight: 1.6,
            }}
          >
            Start your journey as a Digital Curator.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col">

            {/* Full Name */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="signup-your-name"
                className="font-sans"
                style={{ ...labelStyle, color: '#1A1612' }}
              >
                Full Name
              </label>
              <input
                id="signup-your-name"
                type="text"
                required
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="Aditya Shah"
                className="font-sans"
                style={{
                  ...inputStyle,
                  color: '#1A1612',
                  borderBottomColor: '#DDD8CE',
                }}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A8844A'; }}
                onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#DDD8CE'; }}
              />
            </div>

            {/* Store Name */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="signup-store-name"
                className="font-sans"
                style={{ ...labelStyle, color: '#1A1612' }}
              >
                Store Name
              </label>
              <input
                id="signup-store-name"
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Shah Opticals"
                className="font-sans"
                style={{
                  ...inputStyle,
                  color: '#1A1612',
                  borderBottomColor: '#DDD8CE',
                }}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A8844A'; }}
                onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#DDD8CE'; }}
              />
            </div>

            {/* Work Email */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="signup-email"
                className="font-sans"
                style={{ ...labelStyle, color: '#1A1612' }}
              >
                Work Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@store.com"
                className="font-sans"
                style={{
                  ...inputStyle,
                  color: '#1A1612',
                  borderBottomColor: '#DDD8CE',
                }}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A8844A'; }}
                onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#DDD8CE'; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="signup-password"
                className="font-sans"
                style={{ ...labelStyle, color: '#1A1612' }}
              >
                Create Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="font-sans"
                style={{
                  ...inputStyle,
                  color: '#1A1612',
                  borderBottomColor: '#DDD8CE',
                }}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A8844A'; }}
                onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#DDD8CE'; }}
              />
            </div>

            {/* City (hidden field, kept for data) */}
            <input
              type="hidden"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            {/* Terms */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 28,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="accent-gold-500 flex-shrink-0"
                style={{ marginTop: 2, borderRadius: 2 }}
              />
              <span className="font-sans" style={{ fontSize: 12, color: '#6B6560', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: '#A8844A', fontWeight: 700, textDecoration: 'none' }}>
                  Terms of Service
                </Link>
              </span>
            </label>

            {/* Error message */}
            {error && (
              <p className="font-sans" style={{ fontSize: 12, color: '#c0392b', marginBottom: 12 }}>
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !agreed}
              className="font-sans"
              style={{
                width: '100%',
                padding: '14px 0',
                backgroundColor: '#1A1612',
                color: '#FDFAF4',
                border: 'none',
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: loading || !agreed ? 'not-allowed' : 'pointer',
                opacity: loading || !agreed ? 0.5 : 1,
                transition: 'opacity 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 48,
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    style={{ width: 16, height: 16 }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account&hellip;
                </>
              ) : (
                'Create Account \u2192'
              )}
            </button>
          </form>

          {/* Footer */}
          <p
            className="font-sans"
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#6B6560',
              marginTop: 28,
            }}
          >
            Already have an account?{' '}
            <Link
              href="/auth/login"
              style={{
                color: '#A8844A',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Login
            </Link>
          </p>

          {!SUPABASE_CONFIGURED && (
            <p className="font-sans" style={{ fontSize: 11, color: '#9A9490', textAlign: 'center', marginTop: 16 }}>
              Auth not configured — running in demo mode
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
