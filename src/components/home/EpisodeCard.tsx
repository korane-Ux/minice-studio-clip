import Link from 'next/link';
import { episodeHref } from '@/lib/domain/episodes';
import { statusLabel, type StatusTone } from '@/lib/domain/status';
import type { Account, Episode } from '@/lib/domain/types';

const BADGE: Record<StatusTone, string> = {
  attente: 'bg-warning text-ink',
  pret: 'bg-violet text-ink',
  en_cours: 'bg-line text-text',
  publie: 'bg-[#2DD4BF] text-ink',
  rejete: 'bg-danger text-white',
};

export function EpisodeCard({ episode, account, clips }: { episode: Episode; account: Account | undefined; clips?: { done: number; total: number } }) {
  const s = statusLabel(episode.status, clips);
  const color = account?.color ?? '#8880F0';
  return (
    <Link
      href={episodeHref(episode)}
      className="flex flex-col overflow-hidden rounded-card border border-line bg-surface no-underline transition hover:border-violet"
    >
      <div className="relative flex h-56 items-end p-4" style={{ background: `linear-gradient(0deg, ${color}33, ${color}14)` }}>
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${BADGE[s.tone]}`}>{s.label}</span>
        <span className="text-lg font-semibold leading-snug">{episode.title || `Épisode ${episode.number}`}</span>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-muted">
          <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: color }} />
          {account?.name ?? 'Compte'}
        </span>
        <span className="text-muted">
          {episode.status === 'publie' ? (episode.views !== null ? `${episode.views.toLocaleString('fr-FR')} vues` : 'Vues à saisir') : `Ép. ${episode.number}`}
        </span>
      </div>
    </Link>
  );
}
