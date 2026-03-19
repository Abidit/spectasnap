'use client';

import Link from 'next/link';
import { useState } from 'react';
import s from '@/app/landing.module.css';

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  function closeMenu() { setMenuOpen(false); }

  return (
    <>
      <nav className={s.nav}>
        <Link href="/" className={s.navLogo}>Specta<span>Snap</span></Link>

        <ul className={s.navLinks}>
          <li><a href="#problem">Why SpectaSnap</a></li>
          <li><a href="#stores">For Stores</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><Link href="/trydemo" className={s.navCta}>Try It Free →</Link></li>
        </ul>

        <button
          className={`${s.hamburger} ${menuOpen ? s.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`${s.mobileMenu} ${menuOpen ? s.mobileMenuOpen : ''}`}>
        <a href="#problem" className={s.mobileMenuItem} onClick={closeMenu}>Why SpectaSnap</a>
        <a href="#stores"  className={s.mobileMenuItem} onClick={closeMenu}>For Stores</a>
        <a href="#how"     className={s.mobileMenuItem} onClick={closeMenu}>How It Works</a>
        <Link href="/trydemo" className={s.mobileMenuCta} onClick={closeMenu}>Try It Free →</Link>
      </div>

      <div className={s.navSpacer} />
    </>
  );
}
