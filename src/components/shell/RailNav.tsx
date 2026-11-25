import Link from 'next/link';
import type { ReactNode } from 'react';

export type NavKey = 'creer' | 'episodes' | 'studio' | 'comptes' | 'publier' | 'cles';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      {children}
    </svg>
  );
}

const ITEMS: { key: NavKey; label: string; href: string; icon: ReactNode }[] = [
  { key: 'creer', label: 'Créer', href: '/', icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></Icon> },
  {
    key: 'episodes',
    label: 'Épisodes',
    href: '/?vue=episodes',
    icon: (
      <Icon>
        <rect x="4" y="4" width="7" height="7" rx="2" />
        <rect x="13" y="4" width="7" height="7" rx="2" />
        <rect x="4" y="13" width="7" height="7" rx="2" />
        <rect x="13" y="13" width="7" height="7" rx="2" />
      </Icon>
    ),
  },
  { key: 'studio', label: 'Studio', href: '/studio', icon: <Icon><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M8 6l-2 4M13 6l-2 4M18 6l-2 4" /></Icon> },
  { key: 'comptes', label: 'Comptes', href: '/comptes', icon: <Icon><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z" /><path d="M5 20.5A2.5 2.5 0 0 1 7.5 18H19v3H7.5" /></Icon> },
  { key: 'publier', label: 'Publier', href: '/publier', icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 16V8M8.5 11.5 12 8l3.5 3.5" /></Icon> },
  { key: 'cles', label: 'Clés API', href: '/cles-api', icon: <Icon><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l3 3" /></Icon> },
];

export function RailNav({ active }: { active: NavKey }) {
  return (
    <nav
      aria-label="Navigation principale"
      className="flex shrink-0 flex-row items-center gap-1 overflow-x-auto border-b border-line bg-surface-2 px-2 py-2 md:w-[84px] md:flex-col md:items-stretch md:overflow-visible md:border-b-0 md:border-r md:px-2 md:py-4"
    >
      <Link href="/" aria-label="Accueil Minice Studio Clip" className="flex shrink-0 justify-center px-2 md:pb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/minice-icon.png" alt="" width={40} height={40} className="rounded-ctrl" />
      </Link>
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-[58px] min-w-[64px] shrink-0 flex-col items-center justify-center gap-1 rounded-ctrl text-[11px] font-semibold no-underline ${
              isActive ? 'bg-violet-tint text-text' : 'text-muted hover:text-text'
            }`}
          >
            <span className={isActive ? 'text-violet' : undefined}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
      <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0 md:mt-auto md:flex-col">
        <span className="rounded-full bg-warning px-2 py-0.5 text-[10px] font-extrabold text-ink">GRATUIT</span>
      </div>
    </nav>
  );
}
