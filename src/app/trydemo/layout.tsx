import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Try Demo — SpectaSnap',
  description:
    'Launch the SpectaSnap AR demo — browse 50+ frames with real-time 3D try-on, no app or sign-up required.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://spectasnap-orpin.vercel.app/trydemo' },
};

export default function TryDemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
