import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Frames',
  description: 'Submit your custom eyewear frames to be added to SpectaSnap AR try-on.',
  robots: { index: false, follow: false },
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
