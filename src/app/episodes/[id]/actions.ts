'use server';
import { revalidatePath } from 'next/cache';
import { parseAiResponse } from '@/lib/ai/parse';
import { ideaSchema, type Idea } from '@/lib/ai/schemas';
import { scriptStep, summaryStep } from '@/lib/ai/steps';
import { transition } from '@/lib/domain/status';
import { toImportPayload } from '@/lib/episodes/importPayload';
import { loadEpisode } from '@/lib/episodes/load';
import { removeEpisodeFiles } from '@/lib/storage/cleanup';
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

async function setStatus(episodeId: string, event: Parameters<typeof transition>[1], extra: Record<string, unknown> = {}): Promise<StepResult> {
  const { supabase } = await requireUser();
  const { data: ep } = await supabase.from('episodes').select('status').eq('id', episodeId).maybeSingle();
  if (!ep) return { ok: false, error: 'Épisode introuvable.' };
  let next;
  try {
    next = transition(ep.status, event);
  } catch {
    return { ok: false, error: "Cette action n'est pas possible à cette étape." };
  }
  const { error } = await supabase.from('episodes').update({ status: next, ...extra }).eq('id', episodeId);
  if (error) return { ok: false, error: "L'enregistrement a échoué. Réessaie." };
  revalidatePath(`/episodes/${episodeId}`);
  revalidatePath('/');
  return { ok: true };
}

// Appelé après l'envoi direct de la vidéo montée vers le bucket videos.
export async function saveVideo(episodeId: string, path: string): Promise<StepResult> {
  const { user } = await requireUser();
  if (path !== `${user.id}/${episodeId}.mp4`) return { ok: false, error: 'Chemin de vidéo invalide.' };
  return setStatus(episodeId, { type: 'VIDEO_ASSEMBLED' }, { video_path: path });
}

export async function approveEpisode(episodeId: string): Promise<StepResult> {
  return setStatus(episodeId, { type: 'APPROVED' }, { validated_at: new Date().toISOString() });
}

// Rejeter ou abandonner : l'épisode reste dans la liste, ses fichiers sont supprimés.
export async function rejectEpisode(episodeId: string): Promise<StepResult> {
  const result = await setStatus(episodeId, { type: 'REJECTED' });
  if (!result.ok) return result;
  const { supabase } = await requireUser();
  await removeEpisodeFiles(supabase, episodeId, { video: true });
  return result;
}

export async function redoScene(episodeId: string, sceneId: string): Promise<StepResult> {
  const { supabase } = await requireUser();
  const { data: scene } = await supabase.from('scenes').select('id, clip_path').eq('id', sceneId).eq('episode_id', episodeId).maybeSingle();
  if (!scene) return { ok: false, error: 'Scène introuvable.' };
  const { data: ep } = await supabase.from('episodes').select('video_path').eq('id', episodeId).single();
  const result = await setStatus(episodeId, { type: 'REDO_SCENE' }, { video_path: null });
  if (!result.ok) return result;
  await supabase.from('scenes').update({ clip_path: null }).eq('id', sceneId);
  if (scene.clip_path) await supabase.storage.from('clips').remove([scene.clip_path]);
  if (ep?.video_path) await supabase.storage.from('videos').remove([ep.video_path]);
  return { ok: true };
}

export async function updateSummary(accountId: string, raw: string): Promise<StepResult> {
  const { supabase } = await requireUser();
  const parsed = parseAiResponse(raw, summaryStep.schema);
  if (!parsed.ok) return parsed;
  const { error } = await supabase.from('accounts').update({ series_summary: parsed.data.summary }).eq('id', accountId);
  if (error) return { ok: false, error: "Le résumé n'a pas pu être enregistré." };
  return { ok: true };
}
