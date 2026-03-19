'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import s from './landing2.module.css';

const FEATURES = [
  { title: 'Tablet AR experience', desc: 'Full-screen live try-on. Works as a digital mirror. Customers love it — no instructions needed.' },
  { title: 'AI face shape detection', desc: 'Automatically identifies oval, round, square, heart, or oblong face shapes. Recommends the right frames instantly.' },
  { title: 'Staff recommendation panel', desc: 'Your staff sees what to say and which frames to push. Turns every team member into a trained stylist.' },
  { title: 'Weekly analytics dashboard', desc: 'Sessions, most tried frames, face shape breakdown. Know what\'s working, what\'s not.' },
  { title: 'Your own frame catalogue', desc: 'Upload your actual inventory. Customers try your real frames, not generic ones.' },
];

const FAQS = [
  { q: 'Do I need a developer to set this up?', a: 'No. You open a browser on your tablet, go to your store URL, and it works. No installation, no technical knowledge required.' },
  { q: 'Which tablet does it work on?', a: 'Any iPad or Android tablet with a front-facing camera. Works in Chrome and Safari. Even works on a phone if needed.' },
  { q: 'How long does setup take?', a: 'Under 5 minutes. We walk you through it on a WhatsApp call. Most store owners are live the same day.' },
  { q: 'Can I upload my own frames?', a: 'Yes. Send us your frame photos and we\'ll upload them. Your customers try your actual inventory, not generic styles.' },
  { q: 'What does it cost?', a: 'The pilot is completely free for 30 days. After that, a flat monthly fee — no per-customer charges, no surprises.' },
];

const TRUST_ITEMS = [
  ['◈', '50+ frame styles'],
  ['◎', '478-point face tracking'],
  ['◻', 'Works on any tablet'],
  ['◌', 'No app to install'],
  ['◆', 'Setup in 5 minutes'],
] as const;

export default function LandingV2() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [navScrolled, setNavScrolled] = useState(false);
  const [form, setForm] = useState({ name: '', store: '', city: '', phone: '' });

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.store || !form.city || !form.phone) {
      setFormError('Please fill in all fields.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/xojnpnzy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: form.name, store_name: form.store, city: form.city, phone: form.phone }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={s.root}>
      {/* NAV */}
      <nav className={`${s.nav} ${navScrolled ? s.navScrolled : ''}`}>
        <a href="#" className={s.navLogo}>
          Specta<em className={s.navLogoEm}>Snap</em>
        </a>
        <div className={s.navLinks}>
          <a href="#howitworks">How it works</a>
          <a href="#forstores">For stores</a>
          <a href="#pilot">Pricing</a>
          <a href="#pilot" className={s.navCta}>Book a demo</a>
        </div>
      </nav>

      {/* HERO */}
      <section className={s.hero} id="hero">
        <div className={s.heroInner}>
          <div>
            <div className={s.heroEyebrow}>AR Try-On for Optical Stores</div>
            <h1 className={s.heroH1}>
              Your customers<br />try frames.<br /><em>They buy more.</em>
            </h1>
            <p className={s.heroSub}>
              SpectaSnap puts a live AR try-on experience in your store. Customers see themselves in every frame instantly. Your staff closes more sales.
            </p>
            <div className={s.heroActions}>
              <a href="#pilot" className={s.btnPrimary}>Book free demo →</a>
              <Link href="/trydemo" target="_blank" rel="noopener noreferrer" className={s.btnGhost}>
                Try it yourself
              </Link>
            </div>
          </div>
          <div className={s.heroVisual}>
            <div className={`${s.cm} ${s.cmTl}`} />
            <div className={`${s.cm} ${s.cmTr}`} />
            <div className={`${s.cm} ${s.cmBl}`} />
            <div className={`${s.cm} ${s.cmBr}`} />
            <div className={s.heroVisualInner}>
              <div className={s.heroVisualBadge}>
                <div className={s.liveDot} />AR Live
              </div>
              <h3 className={s.heroVisualH3}>See it on your face.</h3>
              <p className={s.heroVisualP}>Live AR demo — no app needed</p>
              <Link href="/trydemo" target="_blank" rel="noopener noreferrer">
                <button className={s.heroVisualTry}>Try frames now →</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className={s.trust}>
        <div className={s.trustInner}>
          {TRUST_ITEMS.map(([icon, text]) => (
            <div key={text} className={s.trustItem}>
              <span className={s.trustIcon}>{icon}</span>
              <span className={s.trustText}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <section className={s.problem} id="problem">
        <div className={s.problemInner}>
          <div className={s.sectionEyebrow}>The problem</div>
          <blockquote className={s.problemQuote}>
            &ldquo;Customers spend 40 minutes trying frames. Half still leave without buying.&rdquo;
          </blockquote>
          <div className={s.statsRow}>
            <div className={s.statCard}>
              <div className={s.statNum}>65%</div>
              <div className={s.statLabel}>of online eyewear shoppers abandon because they can&apos;t try frames before buying</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statNum}>8+</div>
              <div className={s.statLabel}>frames tried on average per store visit — most still leave unsure</div>
            </div>
            <div className={s.statCard}>
              <div className={s.statNum}>1 in 3</div>
              <div className={s.statLabel}>frames bought online are returned — wrong fit, wrong look</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={s.howitworks} id="howitworks">
        <div className={s.hiwInner}>
          <div className={s.hiwHeader}>
            <div>
              <div className={s.sectionEyebrow}>How it works</div>
              <h2 className={s.sectionH2}>Three steps.<br /><em>That&apos;s all.</em></h2>
            </div>
            <p className={s.sectionSub}>No developers needed. No app to download. Works on any iPad or Android tablet.</p>
          </div>
          <div className={s.steps}>
            <div className={s.step}>
              <div className={s.stepNum}>01</div>
              <div className={s.stepTitle}>Place tablet in store</div>
              <p className={s.stepDesc}>Open SpectaSnap on any tablet. Mount it at eye level or hold it — your customer faces the screen like a mirror.</p>
              <div className={s.stepArrow}>→</div>
            </div>
            <div className={s.step}>
              <div className={s.stepNum}>02</div>
              <div className={s.stepTitle}>Customer sees frames live</div>
              <p className={s.stepDesc}>AI detects their face shape instantly. They tap any frame — it appears on their face in real time. 50+ styles to explore.</p>
              <div className={s.stepArrow}>→</div>
            </div>
            <div className={s.step}>
              <div className={s.stepNum}>03</div>
              <div className={s.stepTitle}>Staff closes the sale</div>
              <p className={s.stepDesc}>Your staff panel shows the detected face shape, best frame recommendations, and a staff note. Walk up, say the right thing, close.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section className={s.demo} id="demo">
        <div className={s.demoInner}>
          <div className={s.demoEyebrow}>Live demo</div>
          <h2 className={s.demoH2}>Try it on your<br /><em>own face. Right now.</em></h2>
          <p className={s.demoSub}>No signup. No download. Just your camera and 3 seconds.</p>
          <div className={s.demoFrame}>
            <div className={`${s.cm} ${s.cmTl}`} />
            <div className={`${s.cm} ${s.cmTr}`} />
            <div className={`${s.cm} ${s.cmBl}`} />
            <div className={`${s.cm} ${s.cmBr}`} />
            <div className={s.demoFrameInner}>
              <div className={s.heroVisualBadge}>
                <div className={s.liveDot} />AR Try-On
              </div>
              <h3 className={s.demoFrameH3}>Your face. Your frames.</h3>
              <p>Opens in a new tab — camera required</p>
            </div>
          </div>
          <Link href="/trydemo" target="_blank" rel="noopener noreferrer" className={s.demoTryBtn}>
            Open live try-on →
          </Link>
        </div>
      </section>

      {/* FOR STORES */}
      <section className={s.forstores} id="forstores">
        <div className={s.forstoresInner}>
          <div className={s.sectionEyebrow}>For store owners</div>
          <h2 className={s.sectionH2}>Everything you need.<br /><em>Nothing you don&apos;t.</em></h2>
          <div className={s.forstoresGrid}>
            <div className={s.featureList}>
              {FEATURES.map((f, i) => (
                <div key={i} className={s.featureItem}>
                  <div className={s.featureNum}>{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <div className={s.featureTitle}>{f.title}</div>
                    <div className={s.featureDesc}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className={s.sectionEyebrow} style={{ marginBottom: '20px' }}>Common questions</div>
              <div className={s.faqList}>
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className={s.faqItem}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <div className={`${s.faqQ} ${openFaq === i ? s.faqQOpen : ''}`}>
                      {faq.q}
                      <span className={s.faqIcon}>{openFaq === i ? '−' : '+'}</span>
                    </div>
                    {openFaq === i && <div className={s.faqA}>{faq.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILOT FORM */}
      <section className={s.pilot} id="pilot">
        <div className={s.pilotInner}>
          <div className={s.sectionEyebrow}>Free 30-day pilot</div>
          <h2 className={s.sectionH2}>Start this week.<br /><em>No cost. No commitment.</em></h2>
          <p className={s.pilotSub}>
            We set it up for you on a WhatsApp call. Your customers are trying frames live the same day. Cancel anytime.
          </p>
          {submitted ? (
            <div className={s.successMsg}>
              <p>🎉 <strong>Request received!</strong><br />
              We&apos;ll WhatsApp you within 24 hours to set up your free pilot. Get ready to show your customers something they&apos;ve never seen before.</p>
            </div>
          ) : (
            <>
              <div className={s.formGrid}>
                <div className={s.formField}>
                  <label>Your name</label>
                  <input
                    type="text"
                    placeholder="Rajesh Kumar"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className={s.formField}>
                  <label>Store name</label>
                  <input
                    type="text"
                    placeholder="Vision Care Opticals"
                    value={form.store}
                    onChange={e => setForm(f => ({ ...f, store: e.target.value }))}
                  />
                </div>
                <div className={s.formField}>
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div className={s.formField}>
                  <label>WhatsApp number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>
              {formError && <p className={s.formError}>{formError}</p>}
              <button className={s.formSubmit} onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Sending…' : 'Request free 30-day pilot →'}
              </button>
              <p className={s.formNote}>We&apos;ll WhatsApp you within 24 hours. No spam, ever.</p>
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLogo}>
            Specta<em className={s.footerLogoEm}>Snap</em>
          </div>
          <div className={s.footerLinks}>
            <a href="#howitworks">How it works</a>
            <a href="#forstores">For stores</a>
            <a href="#pilot">Get started</a>
            <a href="#">Privacy</a>
          </div>
          <div className={s.footerCopy}>© 2025 SpectaSnap</div>
        </div>
      </footer>

      {/* MOBILE STICKY CTA */}
      <div className={s.mobileCta}>
        <a href="#pilot">Book your free demo →</a>
      </div>
    </div>
  );
}
