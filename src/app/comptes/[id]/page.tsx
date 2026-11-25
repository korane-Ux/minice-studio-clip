import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AccountForm } from '@/components/bible/AccountForm';
import { CharacterSection } from '@/components/bible/CharacterSection';
import { AppShell } from '@/components/shell/AppShell';
import { STYLE_LABELS, toAccount, toCharacter } from '@/lib/domain/types';
import { requireUser } from '@/lib/supabase/server';
import { updateAccount } from './actions';

export default async function BiblePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const [{ data: accountRows }, { data: characterRows }] = await Promise.all([
    supabase.from('accounts').select('*').order('position'),
    supabase.from('characters').select('*').eq('account_id', id).order('position'),
  ]);
  const accounts = (accountRows ?? []).map(toAccount);
  const account = accounts.find((a) => a.id === id);
  if (!account) notFound();
  const characters = (characterRows ?? []).map(toCharacter);

  const paths = characters.map((c) => c.refImagePath).filter((p): p is string => !!p);
  const urls: Record<string, string> = {};
  if (paths.length) {
    const { data } = await supabase.storage.from('refs').createSignedUrls(paths, 3600);
    for (const s of data ?? []) if (s.path && s.signedUrl) urls[s.path] = s.signedUrl;
  }

  return (
    <AppShell active="comptes">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: account.color }}>
              Compte {account.position} · {STYLE_LABELS[account.style]}
            </p>
            <h1 className="text-3xl font-bold">{account.name}</h1>
          </div>
          <nav aria-label="Autres comptes" className="flex flex-wrap gap-2">
            {accounts
              .filter((a) => a.id !== account.id)
              .map((a) => (
                <Link
                  key={a.id}
                  href={`/comptes/${a.id}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-ctrl border border-line px-4 text-sm font-semibold no-underline"
                >
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: a.color }} />
                  {a.name}
                </Link>
              ))}
          </nav>
        </header>

        <section aria-labelledby="perso-titre" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
          <h2 id="perso-titre" className="text-lg font-semibold">
            Personnages
          </h2>
          <CharacterSection accountId={account.id} userId={user.id} characters={characters} imageUrls={urls} />
        </section>

        <AccountForm account={account} hasApiKeys={false} action={updateAccount.bind(null, account.id)} />
      </main>
    </AppShell>
  );
}
