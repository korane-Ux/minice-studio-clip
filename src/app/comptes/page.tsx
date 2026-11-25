import { redirect } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { requireUser } from '@/lib/supabase/server';

export default async function ComptesPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase.from('accounts').select('id').order('position').limit(1);
  if (data?.[0]) redirect(`/comptes/${data[0].id}`);

  const { data: created } = await supabase.rpc('seed_default_accounts');
  if (created) redirect('/comptes');
  return (
    <AppShell active="comptes">
      <main className="p-10">
        <p role="alert">Tes comptes n&apos;ont pas pu être créés. Recharge la page dans un instant.</p>
      </main>
    </AppShell>
  );
}
