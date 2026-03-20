import type { Metadata, Viewport } from 'next';
import '../globals.css';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=Sora:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="bg-brand-camera">{children}</body>
    </html>
  );
}
