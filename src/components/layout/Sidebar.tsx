'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Camera, LayoutDashboard, Glasses, Upload,
  QrCode, FileText, Settings,
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const TOP_NAV: NavItem[] = [
  { label: 'Try-On',    href: '/trydemo',   icon: Camera },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Frames',    href: '/frames',    icon: Glasses },
  { label: 'Upload',    href: '/upload',    icon: Upload },
  { label: 'QR Code',   href: '/qr',        icon: QrCode },
  { label: 'One-Pager', href: '/onepager',  icon: FileText },
];

const BOTTOM_NAV: NavItem[] = [
  { label: 'Settings',  href: '/dashboard', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={clsx(
        'flex items-center gap-3 h-10 px-3 rounded-sharp transition-colors duration-150',
        'text-sm text-ink-500 no-underline group',
        isActive
          ? 'bg-gold-100 text-ink-900 font-medium border-l-2 border-gold-500 pl-[10px]'
          : 'hover:bg-cream-200 border-l-2 border-transparent',
      )}
    >
      <Icon
        size={18}
        className={clsx(
          'flex-shrink-0 transition-colors',
          isActive ? 'text-gold-600' : 'text-ink-300 group-hover:text-ink-500',
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col sticky top-0 h-screen flex-shrink-0',
        'bg-cream-50 border-r border-cream-400',
        'transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      {/* Logo area — aligns with TopBar height */}
      <div
        className="flex flex-col justify-center px-3 border-b border-cream-400"
        style={{ height: 64 }}
      >
        {!collapsed && (
          <>
            <span className="font-serif text-base font-semibold text-ink-900">
              Specta<em className="text-gold-500 not-italic italic">Snap</em>
            </span>
            <span className="text-[9px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-300 mt-0.5">
              Digital Curator
            </span>
          </>
        )}
      </div>

      {/* Top nav items */}
      <nav className="flex flex-col gap-1 p-2 pt-3">
        {TOP_NAV.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom nav items */}
      <nav className="flex flex-col gap-1 p-2 pb-3 border-t border-cream-400">
        {BOTTOM_NAV.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
