'use server';
import { revalidatePath } from 'next/cache';
import { parseAiResponse } from '@/lib/ai/parse';
import { ideaSchema, type Idea } from '@/lib/ai/schemas';
import { scriptStep } from '@/lib/ai/steps';
import { transition } from '@/lib/domain/status';
import { toImportPayload } from '@/lib/episodes/importPayload';
import { loadEpisode } from '@/lib/episodes/load';
import { requireUser } from '@/lib/supabase/server';

export type StepResult = { ok: true } | { ok: false; error: string };

export async function chooseIdea(episodeId: string, idea: Idea): Promise<StepResult> {
  const { supabase } = await requireUser();
  const parsed = ideaSchema.safeParse(idea);
  if (!parsed.success) return { ok: false, error: 'Cette idée est incomplète : titre, histoire et leçon sont nécessaires.' };
  const { error } = await supabase.from('episodes').update({ idea: parsed.data, title: parsed.data.title }).eq('id', episodeId);
  if (error) return { ok: false, error: "L'idée n'a pas pu être enregistrée." };
  revalidatePath(`/episodes/${episodeId}`);
  return { ok: true };
}

export async function importScript(episodeId: string, raw: string): Promise<StepResult> {
  const { supabase } = await requireUser();
  const parsed = parseAiResponse(raw, scriptStep.schema);
  if (!parsed.ok) return parsed;

  const bundle = await loadEpisode(supabase, episodeId);
  if (!bundle) return { ok: false, error: 'Épisode introuvable.' };
  try {
    transition(bundle.episode.status, { type: 'SCRIPT_IMPORTED' });
  } catch {
    return { ok: false, error: 'Le script de cet épisode est déjà importé.' };
  }

  const prepared = toImportPayload(parsed.data, bundle.ctx);
  if (!prepared.ok) return prepared;

  const { error } = await supabase.rpc('import_script', { p_episode_id: episodeId, p_payload: prepared.payload });
  if (error) return { ok: false, error: "Le script n'a pas pu être enregistré. Vérifie les durées des scènes (8 secondes maximum)." };
  revalidatePath(`/episodes/${episodeId}`);
  return { ok: true };
}
