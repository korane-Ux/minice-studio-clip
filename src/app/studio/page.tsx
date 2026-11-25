import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/supabase/server';

// « Studio » dans la barre latérale : reprend l'épisode en cours le plus récent.
export default async function StudioPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from('episodes')
    .select('id')
    .in('status', ['idee', 'scenes', 'montage', 'a_valider'])
    .order('created_at', { ascending: false })
    .limit(1);
  redirect(data?.[0] ? `/episodes/${data[0].id}` : '/');
}
