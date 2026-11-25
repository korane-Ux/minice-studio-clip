import type { EpisodeStatus } from './status';

export function nextEpisodeNumber(existing: number[]): number {
  return existing.length ? Math.max(...existing) + 1 : 1;
}

export function episodeHref(e: { id: string; status: EpisodeStatus }): string {
  return e.status === 'valide' || e.status === 'publie' ? `/publier/${e.id}` : `/episodes/${e.id}`;
}

export function displayName(user: { email?: string | null; user_metadata?: Record<string, unknown> }): string {
  const meta = user.user_metadata?.first_name;
  if (typeof meta === 'string' && meta.trim()) return meta.trim();
  const local = user.email?.split('@')[0]?.split(/[._-]/)[0];
  if (!local) return 'toi';
  return local.charAt(0).toUpperCase() + local.slice(1);
}
