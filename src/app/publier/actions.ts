'use server';
import { revalidatePath } from 'next/cache';
import { transition } from '@/lib/domain/status';
import { removeEpisodeFiles } from '@/lib/storage/cleanup';
import { requireUser } from '@/lib/supabase/server';
import { parseViews } from '@/lib/validation/views';

type Result = { ok: true } | { ok: false; error: string };

export async function markPublished(episodeId: string): Promise<Result> {
  const { supabase } = await requireUser();
  const { data: ep } = await supabase.from('episodes').select('status').eq('id', episodeId).maybeSingle();
  if (!ep) return { ok: false, error: 'Épisode introuvable.' };
  try {
    transition(ep.status, { type: 'PUBLISHED' });
  } catch {
    return { ok: false, error: "Cet épisode n'est pas encore validé." };
  }
  const { error } = await supabase.from('episodes').update({ status: 'publie', published_at: new Date().toISOString() }).eq('id', episodeId);
  if (error) return { ok: false, error: "L'enregistrement a échoué. Réessaie." };
  await removeEpisodeFiles(supabase, episodeId, { video: false });
  revalidatePath('/publier');
  revalidatePath('/');
  return { ok: true };
}

export async function saveViews(episodeId: string, input: string): Promise<Result> {
  const parsed = parseViews(input);
  if (!parsed.ok) return parsed;
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from('episodes')
    .update({ views: parsed.value, views_updated_at: new Date().toISOString() })
    .eq('id', episodeId)
    .eq('status', 'publie');
  if (error) return { ok: false, error: "Les vues n'ont pas pu être enregistrées." };
  revalidatePath('/');
  return { ok: true };
}
