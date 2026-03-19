import Link from 'next/link';
import LandingNav from '@/components/LandingNav';
import PilotForm from './PilotForm';
import s from './landing.module.css';

export default function LandingClient() {
  return (
    <div className={s.root}>
      <LandingNav />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className={s.hero}>
        <div className={s.heroBadge}>
          <span className={s.heroBadgeDot} />
          Now live — no app install needed
        </div>
        <h1 className={s.h1}>
          See Yourself in Any Frame.<br />
          <em>Instantly.</em>
        </h1>
        <p className={s.subhead}>
          Real-time 3D glasses try-on for optical stores and online shoppers —
          powered by AI face tracking, running entirely in the browser.
        </p>
        <div className={s.btnGroup}>
          <Link href="/trydemo" className={s.btnPrimary}>✦ Try It Now — Free</Link>
          <a href="#stores" className={s.btnSecondary}>For Optical Stores →</a>
        </div>
        <div className={s.heroVisual}>
          <div className={s.heroVisualInner}>
            <div className={s.heroVisualIcon}>🕶️</div>
            <div className={s.heroVisualText}>AR Try-On Preview</div>
          </div>
          <Link href="/trydemo" className={s.heroVisualCta}>▶ Open Live Demo</Link>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className={s.statsBar}>
        <div className={s.statsGrid}>
          <div className={s.statItem}>
            <div className={s.statNum}>50<span>+</span></div>
            <div className={s.statLabel}>Frame styles</div>
          </div>
          <div className={s.statItem}>
            <div className={s.statNum}>478</div>
            <div className={s.statLabel}>Face landmarks tracked</div>
          </div>
          <div className={s.statItem}>
            <div className={s.statNum}>60<span>fps</span></div>
            <div className={s.statLabel}>Real-time tracking</div>
          </div>
          <div className={s.statItem}>
            <div className={s.statNum}>0</div>
            <div className={s.statLabel}>Apps to install</div>
          </div>
        </div>
      </div>

      {/* ── Problem ─────────────────────────────────────────────────────── */}
      <section id="problem" className={s.problemSection}>
        <div className={s.splitGrid}>
          <div>
            <span className={s.label}>The Problem</span>
            <h2 className={s.h2}>Trying on glasses is still broken</h2>
            <ul className={s.problemList}>
              <li className={s.problemItem}>
                <div className={s.problemIcon}>😤</div>
                <div className={s.problemText}>
                  <strong>In-store: slow and awkward</strong>
                  <span>Customers try 10 pairs, remember none. Staff can&apos;t keep up.</span>
                </div>
              </li>
              <li className={s.problemItem}>
                <div className={s.problemIcon}>🛒</div>
                <div className={s.problemText}>
                  <strong>Online: high return rates</strong>
                  <span>30–40% of frames get returned because they don&apos;t fit as expected.</span>
                </div>
              </li>
              <li className={s.problemItem}>
                <div className={s.problemIcon}>📱</div>
                <div className={s.problemText}>
                  <strong>Existing AR tools require an app</strong>
                  <span>Customers don&apos;t want another download just to check a frame.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className={s.solutionBox}>
            <span className={s.label}>The SpectaSnap Fix</span>
            <h3 className={s.h3}>Instant try-on, zero friction</h3>
            <ul className={s.solutionList}>
              {[
                'Browser-native — no app, no plugin',
                'Works on any phone or laptop with a camera',
                'Real-time 3D glasses tracked to your face',
                '50+ frame styles in one session',
                'Staff panel with fit notes and occasion guides',
                'Embeds directly in your store or website',
              ].map((item) => (
                <li key={item} className={s.solutionItem}>
                  <div className={s.checkIcon}>✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Demo highlight ──────────────────────────────────────────────── */}
      <section className={s.demoSection}>
        <div className={s.sectionNarrow}>
          <span className={s.label}>Live Demo</span>
          <h2 className={s.h2}>See it work on your face — right now</h2>
          <p className={s.subhead}>
            No sign-up. Just open the demo, allow camera access, and browse 50+ frames in real time.
          </p>
        </div>
        <div className={s.demoFrame}>
          <div className={s.demoOverlay}>
            <div className={s.demoOverlayTitle}>Real-time AR try-on</div>
            <div className={s.demoOverlaySub}>Glasses track your face in 3D at 60fps</div>
            <Link href="/trydemo" className={s.demoBtn}>Open Demo →</Link>
          </div>
          <div className={s.demoDots}>
            <div className={`${s.demoDot} ${s.demoDotActive}`} />
            <div className={s.demoDot} />
            <div className={s.demoDot} />
          </div>
        </div>
      </section>

      {/* ── Pilot section ───────────────────────────────────────────────── */}
      <section id="pilot" className={s.pilotSection}>
        <div className={s.pilotInner}>
          <div className={s.pilotCopy}>
            <span className={s.label}>B2B Pilot</span>
            <h2 className={s.h2}>Pilot SpectaSnap in Your Store</h2>
            <p className={s.pilotSubhead}>
              Run a 7-day tablet pilot. We&apos;ll help you set it up and learn what converts.
            </p>
            <ul className={s.pilotBullets}>
              <li>Setup in minutes</li>
              <li>Works on store Wi-Fi</li>
              <li>Prototype pilot — limited slots</li>
            </ul>
          </div>
          <PilotForm />
        </div>
      </section>

      {/* ── For Stores ──────────────────────────────────────────────────── */}
      <section id="stores" className={s.storesSection}>
        <div className={s.storesSectionInner}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <span className={s.label}>For Optical Stores</span>
            <h2 className={s.h2}>Give every customer the perfect fitting session</h2>
            <p className={s.body}>
              SpectaSnap turns any device into a smart try-on kiosk — no hardware required.
            </p>
          </div>
          <div className={s.cardsGrid}>
            {[
              { icon: '🏪', title: 'In-store kiosk mode', body: 'Mount a tablet at the counter. Customers browse and try frames independently, freeing staff for consultations.' },
              { icon: '🌐', title: 'Embed on your website', body: 'One script tag. Customers try frames before they visit — or buy online with confidence.' },
              { icon: '📊', title: 'Staff assist panel', body: 'Each frame shows face-shape recommendations, occasion tags, and a staff-ready conversation note.' },
              { icon: '🔄', title: 'Reduce returns', body: 'When customers can truly see how a frame looks on them, return rates drop and conversion goes up.' },
              { icon: '⚡', title: 'Zero onboarding', body: 'No SDK integration, no app store approval. Share a link or embed — live in under 10 minutes.' },
              { icon: '🎨', title: 'Customisable catalog', body: 'Drop in your own GLB frame models. The 50-frame procedural catalog works out of the box while you set up.' },
            ].map((card) => (
              <div key={card.title} className={s.card}>
                <div className={s.cardIcon}>{card.icon}</div>
                <h3 className={s.h3}>{card.title}</h3>
                <p className={s.body}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how" className={s.howSection}>
        <div className={s.sectionNarrow}>
          <span className={s.label}>How It Works</span>
          <h2 className={s.h2}>Three steps to the perfect frame</h2>
        </div>
        <div className={s.stepsGrid}>
          {[
            { n: '1', title: 'Open the demo', body: 'Click "Try It Now". Allow camera access. No download, no sign-up.' },
            { n: '2', title: 'Browse 50+ frames', body: 'Scroll through rounds, rectangles, aviators, cat-eyes, and sport wraps.' },
            { n: '3', title: 'See the perfect fit', body: 'Frames track your face in real-time 3D. Turn your head — they move with you.' },
          ].map((step) => (
            <div key={step.n} className={s.step}>
              <div className={s.stepNum}>{step.n}</div>
              <h3 className={s.h3}>{step.title}</h3>
              <p className={s.body}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className={s.ctaSection}>
        <h2 className={s.h2}>Ready to try it on?</h2>
        <p className={s.subhead}>Takes 10 seconds to start. Works on any device. No account needed.</p>
        <Link href="/trydemo" className={s.ctaBtnPrimary}>✦ Launch AR Try-On</Link>
        <div className={s.ctaNote}>Free to use · No app required · Camera stays on-device</div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className={s.footer}>
        <Link href="/" className={s.footerLogo}>Specta<span>Snap</span></Link>
        <ul className={s.footerLinks}>
          <li><Link href="/trydemo">Try Demo</Link></li>
          <li><a href="#stores">For Stores</a></li>
          <li><a href="#how">How It Works</a></li>
        </ul>
        <div className={s.footerCopy}>© 2026 SpectaSnap · All rights reserved</div>
      </footer>
      {/* ── Sticky CTA bar (mobile + tablet) ────────────────────────────── */}
      <div className={s.stickyBar} aria-hidden="true">
        <Link href="/trydemo" className={s.stickyPrimary}>Try Live Demo</Link>
        <a href="#pilot" className={s.stickySecondary}>Request Pilot</a>
      </div>

    </div>
  );
}
