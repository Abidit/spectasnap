import type { Metadata, Viewport } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

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

const SITE_URL = 'https://spectasnap-orpin.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SpectaSnap — Real-Time 3D Glasses Try-On',
    template: '%s — SpectaSnap',
  },
  description:
    'Try on 50+ eyeglass frames in real time from your browser — no app needed. AI face tracking for optical stores and online shoppers.',
  keywords: ['AR glasses', 'virtual try-on', 'eyewear', 'face tracking', 'optical store', 'MediaPipe'],
  openGraph: {
    siteName: 'SpectaSnap',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F7F7F5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
