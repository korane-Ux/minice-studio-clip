import { AppShell } from '@/components/shell/AppShell';
import { ImportBatch } from '@/components/studio/ImportBatch';
import { toAccount, toCharacter } from '@/lib/domain/types';
import { requireUser } from '@/lib/supabase/server';

export default async function ImportPage() {
  const { supabase } = await requireUser();
  const [{ data: accountRows }, { data: characterRows }] = await Promise.all([
    supabase.from('accounts').select('*').order('position'),
    supabase.from('characters').select('*').order('position'),
  ]);
  const characters = (characterRows ?? []).map(toCharacter);
  const contexts = (accountRows ?? []).map(toAccount).map((account) => ({
    account,
    characters: characters.filter((c) => c.accountId === account.id),
    summary: account.seriesSummary,
  }));

  return (
    <AppShell active="creer">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-10">
        <div>
          <h1 className="text-3xl font-bold">Importer un lot</h1>
          <p className="mt-1 text-sm text-muted">Demande plusieurs épisodes d&apos;un coup à Claude, puis importe-les ici. Ils arrivent directement à l&apos;étape des scènes.</p>
        </div>
        <ImportBatch contexts={contexts} />
      </main>
    </AppShell>
  );
}
