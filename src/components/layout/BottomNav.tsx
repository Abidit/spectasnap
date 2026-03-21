'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, LayoutDashboard, Glasses, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';

const TABS = [
  { label: 'Try-On',    href: '/trydemo',   icon: Camera },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Frames',    href: '/frames',    icon: Glasses },
  { label: 'More',      href: '#more',      icon: MoreHorizontal },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30
                 bg-cream-50 border-t border-cream-400"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2',
                'text-[10px] font-sans font-semibold uppercase tracking-[0.1em]',
                'transition-colors no-underline',
                isActive ? 'text-gold-600' : 'text-ink-300 hover:text-ink-500',
              )}
            >
              <Icon
                size={22}
                className={isActive ? 'text-gold-500' : ''}
              />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
