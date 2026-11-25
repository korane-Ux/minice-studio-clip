import type { Supabase } from '@/lib/supabase/server';

// L'offre gratuite de Supabase donne 1 Go de stockage : on libère les fichiers dont on n'a plus besoin.
// Clips : supprimés dès que l'épisode est publié ou rejeté. Vidéo finale : supprimée seulement au rejet.
export async function removeEpisodeFiles(supabase: Supabase, episodeId: string, opts: { video: boolean }): Promise<void> {
  const { data: scenes } = await supabase.from('scenes').select('clip_path').eq('episode_id', episodeId);
  const clips = (scenes ?? []).map((s) => s.clip_path).filter((p): p is string => Boolean(p));
  if (clips.length) {
    await supabase.storage.from('clips').remove(clips);
    await supabase.from('scenes').update({ clip_path: null }).eq('episode_id', episodeId);
  }
  if (!opts.video) return;
  const { data: ep } = await supabase.from('episodes').select('video_path').eq('id', episodeId).maybeSingle();
  if (ep?.video_path) {
    await supabase.storage.from('videos').remove([ep.video_path]);
    await supabase.from('episodes').update({ video_path: null }).eq('id', episodeId);
  }
}
