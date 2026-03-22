import type { Metadata, Viewport } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'SpectaSnap AR Try-On',
  description: 'Embeddable AR glasses try-on widget powered by SpectaSnap.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-brand-camera ${inter.variable} ${cormorant.variable}`}>
        {children}
      </body>
    </html>
  );
}
