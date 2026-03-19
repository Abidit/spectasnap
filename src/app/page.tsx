import type { Metadata } from 'next';
import LandingClient from './LandingClient';

const META_DESC =
  'Try on 50+ eyeglass frames in real time from your browser — no app needed. AI face tracking for optical stores and online shoppers.';

export const metadata: Metadata = {
  title: 'SpectaSnap — Real-Time 3D Glasses Try-On',
  description: META_DESC,
  alternates: { canonical: 'https://spectasnap-orpin.vercel.app/' },
  openGraph: {
    title: 'SpectaSnap — Real-Time 3D Glasses Try-On',
    description: META_DESC,
    url: 'https://spectasnap-orpin.vercel.app/',
    type: 'website',
    images: [{ url: 'https://spectasnap-orpin.vercel.app/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpectaSnap — Real-Time 3D Glasses Try-On',
    description: META_DESC,
    images: ['https://spectasnap-orpin.vercel.app/og-image.svg'],
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'SpectaSnap',
      url: 'https://spectasnap-orpin.vercel.app/',
    },
    {
      '@type': 'WebApplication',
      name: 'SpectaSnap',
      url: 'https://spectasnap-orpin.vercel.app/',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: META_DESC,
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LandingClient />
    </>
  );
}
