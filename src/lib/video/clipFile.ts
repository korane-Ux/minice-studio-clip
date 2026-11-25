export type ClipExt = 'mp4' | 'webm' | 'mov';

const BY_TYPE: Record<string, ClipExt> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
const BY_EXT: Record<string, ClipExt> = { mp4: 'mp4', webm: 'webm', mov: 'mov' };
// Offre gratuite de Supabase : 50 Mo maximum par fichier.
const MAX_CLIP = 50 * 1024 * 1024;

export function validateClipFile(file: { name: string; type: string; size: number }): { ok: true; ext: ClipExt } | { ok: false; error: string } {
  const fromExt = BY_EXT[file.name.split('.').pop()?.toLowerCase() ?? ''];
  const ext = file.type ? BY_TYPE[file.type] : fromExt;
  if (!ext) return { ok: false, error: 'Format refusé : MP4, WebM ou MOV uniquement.' };
  if (file.size > MAX_CLIP) return { ok: false, error: 'Clip trop lourd : 50 Mo maximum.' };
  return { ok: true, ext };
}

export function clipPath(userId: string, episodeId: string, sceneId: string, ext: ClipExt): string {
  return `${userId}/${episodeId}/${sceneId}.${ext}`;
}

// Un chemin envoyé par le navigateur doit commencer par le préfixe attendu et ne rien contenir d'autre.
export function isOwnPath(path: string, prefix: string): boolean {
  if (!path.startsWith(prefix)) return false;
  const rest = path.slice(prefix.length);
  return /^[a-z0-9]{2,5}$/.test(rest);
}
