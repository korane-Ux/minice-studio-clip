'use server';
import { revalidatePath } from 'next/cache';
import { statusAfterClips } from '@/lib/domain/clips';
import type { EpisodeStatus } from '@/lib/domain/status';
import { requireUser, type Supabase } from '@/lib/supabase/server';
import { isOwnPath } from '@/lib/video/clipFile';

export type ClipResult = { ok: true; status: EpisodeStatus } | { ok: false; error: string };

async function sceneAndEpisode(supabase: Supabase, sceneId: string) {
  const { data: scene } = await supabase.from('scenes').select('id, episode_id, clip_path').eq('id', sceneId).maybeSingle();
  if (!scene) return null;
  const { data: episode } = await supabase.from('episodes').select('id, status').eq('id', scene.episode_id).single();
  if (!episode) return null;
  return { scene, episode };
}

async function refreshStatus(supabase: Supabase, episodeId: string, status: EpisodeStatus): Promise<ClipResult> {
  const { data: scenes } = await supabase.from('scenes').select('clip_path').eq('episode_id', episodeId);
  const next = statusAfterClips(status, (scenes ?? []).map((s) => ({ clipPath: s.clip_path })));
  if (next !== status) await supabase.from('episodes').update({ status: next }).eq('id', episodeId);
  revalidatePath(`/episodes/${episodeId}`);
  return { ok: true, status: next };
}

// Appelé après l'envoi direct du clip vers le bucket clips (voir src/lib/storage/upload.ts).
export async function registerClip(sceneId: string, path: string): Promise<ClipResult> {
  const { supabase, user } = await requireUser();
  const found = await sceneAndEpisode(supabase, sceneId);
  if (!found) return { ok: false, error: 'Scène introuvable.' };
  const { scene, episode } = found;
  if (episode.status !== 'scenes' && episode.status !== 'montage') return { ok: false, error: "Cet épisode n'est plus à l'étape des scènes." };
  if (!isOwnPath(path, `${user.id}/${episode.id}/${sceneId}.`)) return { ok: false, error: 'Chemin de clip invalide.' };

  const { error } = await supabase.from('scenes').update({ clip_path: path }).eq('id', sceneId);
  if (error) return { ok: false, error: "Le clip n'a pas pu être enregistré." };
  // Remplacement avec une autre extension : l'ancien fichier occuperait le stockage pour rien.
  if (scene.clip_path && scene.clip_path !== path) await supabase.storage.from('clips').remove([scene.clip_path]);
  return refreshStatus(supabase, episode.id, episode.status);
}

export async function removeClip(sceneId: string): Promise<ClipResult> {
  const { supabase } = await requireUser();
  const found = await sceneAndEpisode(supabase, sceneId);
  if (!found) return { ok: false, error: 'Scène introuvable.' };
  const { scene, episode } = found;
  if (episode.status !== 'scenes' && episode.status !== 'montage') return { ok: false, error: "Cet épisode n'est plus à l'étape des scènes." };

  await supabase.from('scenes').update({ clip_path: null }).eq('id', sceneId);
  if (scene.clip_path) await supabase.storage.from('clips').remove([scene.clip_path]);
  return refreshStatus(supabase, episode.id, episode.status);
}
