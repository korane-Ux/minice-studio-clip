import Link from 'next/link';
import type { Account, Episode } from '@/lib/domain/types';
import { EpisodeCard } from './EpisodeCard';

export function EpisodeGrid({
  episodes,
  accounts,
  filter,
  clips,
}: {
  episodes: Episode[];
  accounts: Account[];
  filter: string | null;
  clips: Record<string, { done: number; total: number }>;
}) {
  const byId = new Map(accounts.map((a) => [a.id, a]));
  const shown = filter ? episodes.filter((e) => e.accountId === filter) : episodes;

  return (
    <section aria-labelledby="ep-titre" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <h2 id="ep-titre" className="text-xl font-bold">
          Tes épisodes
        </h2>
        <nav aria-label="Filtrer par compte" className="flex flex-wrap gap-1 text-sm font-semibold">
          <Link href="/?vue=episodes" aria-current={filter === null ? 'true' : undefined} className={`rounded-ctrl px-3 py-2 no-underline ${filter === null ? 'bg-violet-tint' : 'text-muted'}`}>
            Récents
          </Link>
          {accounts.map((a) => (
            <Link
              key={a.id}
              href={`/?vue=episodes&compte=${a.id}`}
              aria-current={filter === a.id ? 'true' : undefined}
              className={`rounded-ctrl px-3 py-2 no-underline ${filter === a.id ? 'bg-violet-tint' : 'text-muted'}`}
            >
              {a.name}
            </Link>
          ))}
        </nav>
      </div>
      {shown.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-8 text-center text-muted">
          Aucun épisode pour l’instant. Décris une idée plus haut pour commencer.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
          {shown.map((e) => (
            <EpisodeCard key={e.id} episode={e} account={byId.get(e.accountId)} clips={clips[e.id]} />
          ))}
        </div>
      )}
    </section>
  );
}
