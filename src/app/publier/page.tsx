import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { toAccount, toEpisode, type Account, type Episode } from '@/lib/domain/types';
import { requireUser } from '@/lib/supabase/server';

export default async function PublishListPage() {
  const { supabase } = await requireUser();
  const [{ data: accountRows }, { data: rows }] = await Promise.all([
    supabase.from('accounts').select('*'),
    supabase.from('episodes').select('*').in('status', ['valide', 'publie']).order('validated_at', { ascending: false }),
  ]);
  const accounts = new Map((accountRows ?? []).map((r) => [r.id, toAccount(r)]));
  const episodes = (rows ?? []).map(toEpisode);
  const toPublish = episodes.filter((e) => e.status === 'valide');
  const toCount = episodes.filter((e) => e.status === 'publie' && e.views === null);

  return (
    <AppShell active="publier">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-4 md:p-10">
        <h1 className="text-2xl font-bold">Publier</h1>
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold">Prêts à publier</h2>
          <EpisodeList items={toPublish} accounts={accounts} empty="Aucun épisode validé pour l’instant." cta="Publier" />
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold">Vues à saisir</h2>
          <EpisodeList items={toCount} accounts={accounts} empty="Toutes les vues sont à jour." cta="Saisir" />
        </section>
      </main>
    </AppShell>
  );
}

function EpisodeList({ items, accounts, empty, cta }: { items: Episode[]; accounts: Map<string, Account>; empty: string; cta: string }) {
  if (items.length === 0) return <p className="rounded-card border border-dashed border-line p-5 text-sm text-muted">{empty}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((e) => {
        const a = accounts.get(e.accountId);
        return (
          <li key={e.id}>
            <Link href={`/publier/${e.id}`} className="flex min-h-16 items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 no-underline">
              <span className="flex min-w-0 flex-col">
                <span className="flex items-center gap-2 text-xs text-muted">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: a?.color }} />
                  {a?.name} · Ép. {e.number}
                </span>
                <span className="truncate font-semibold">{e.title}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-violet">{cta} ›</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
