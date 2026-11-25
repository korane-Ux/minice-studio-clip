import type { ReactNode } from 'react';
import { RailNav, type NavKey } from './RailNav';

export function AppShell({ active, children }: { active: NavKey; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-text md:flex-row">
      <RailNav active={active} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
