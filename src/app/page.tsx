import Link from 'next/link';
import { EpisodeGrid } from '@/components/home/EpisodeGrid';
import { HeroPrompt } from '@/components/home/HeroPrompt';
import { AppShell } from '@/components/shell/AppShell';
import { displayName } from '@/lib/domain/episodes';
import { accountStats, verdict } from '@/lib/domain/stats';
import { toAccount, toEpisode } from '@/lib/domain/types';
import { requireUser } from '@/lib/supabase/server';

const VERDICT_LABEL = { pas_assez: 'Pas encore assez de vues saisies', prend: 'Ça prend', ne_prend_pas: 'Ça ne prend pas encore' } as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ compte?: string }> }) {
  const { compte } = await searchParams;
  const { supabase, user } = await requireUser();

  const [{ data: accountRows }, { data: episodeRows }] = await Promise.all([
    supabase.from('accounts').select('*').order('position'),
    supabase.from('episodes').select('*').order('created_at', { ascending: false }),
  ]);
  const accounts = (accountRows ?? []).map(toAccount);
  const episodes = (episodeRows ?? []).map(toEpisode);

  const inScenes = episodes.filter((e) => e.status === 'scenes').map((e) => e.id);
  const clips: Record<string, { done: number; total: number }> = {};
  if (inScenes.length) {
    const { data: scenes } = await supabase.from('scenes').select('episode_id, clip_path').in('episode_id', inScenes);
    for (const s of scenes ?? []) {
      const c = (clips[s.episode_id] ??= { done: 0, total: 0 });
      c.total += 1;
      if (s.clip_path) c.done += 1;
    }
  }

  const now = new Date();
  return (
    <AppShell active="creer">
      <div className="border-b border-line bg-surface-2 px-4 py-2.5 text-center text-sm text-muted">
        Mode gratuit : connecte tes clés API pour activer le pilote automatique.{' '}
        <Link href="/cles-api" className="font-semibold text-violet">
          Activer
        </Link>
      </div>
      <main className="flex-1 bg-[radial-gradient(ellipse_60%_360px_at_50%_0%,rgba(136,128,240,0.18),transparent)] px-4 pb-12 md:px-12">
        <HeroPrompt firstName={displayName(user)} accounts={accounts} />

        <section aria-label="Tes comptes" className="mx-auto mb-10 grid max-w-6xl grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {accounts.map((a) => {
            const mine = episodes.filter((e) => e.accountId === a.id);
            const s = accountStats(mine, now);
            return (
              <Link key={a.id} href={`/comptes/${a.id}`} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 no-underline hover:border-violet">
                <span className="flex items-center gap-2 font-semibold">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />
                  {a.name}
                </span>
                <span className="text-sm text-muted">
                  Cette semaine : <strong className="text-text">{s.thisWeek} / 3</strong> · Vues moyennes :{' '}
                  <strong className="text-text">{s.avgViews !== null ? s.avgViews.toLocaleString('fr-FR') : 'à saisir'}</strong>
                </span>
                <span className="text-xs text-muted">{VERDICT_LABEL[verdict(mine)]}</span>
              </Link>
            );
          })}
        </section>

        <div className="mx-auto max-w-6xl">
          <EpisodeGrid episodes={episodes} accounts={accounts} filter={compte ?? null} clips={clips} />
        </div>
      </main>
    </AppShell>
  );
}
