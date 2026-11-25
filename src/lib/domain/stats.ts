import type { Episode } from './types';

const TZ = 'Europe/Paris';

// Décalage (ms) entre l'heure de Paris et UTC à un instant donné.
function parisOffsetMs(at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - at.getTime() + at.getMilliseconds();
}

// Minuit (heure de Paris) du jour civil donné, exprimé en instant UTC.
function parisMidnight(year: number, month: number, day: number): Date {
  const guess = new Date(Date.UTC(year, month, day));
  return new Date(guess.getTime() - parisOffsetMs(guess));
}

export function weekRange(now: Date): { start: Date; end: Date } {
  const local = new Date(now.getTime() + parisOffsetMs(now));
  const dayFromMonday = (local.getUTCDay() + 6) % 7;
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = local.getUTCDate() - dayFromMonday;
  return { start: parisMidnight(y, m, d), end: parisMidnight(y, m, d + 7) };
}

export function accountStats(episodes: Episode[], now: Date): { thisWeek: number; avgViews: number | null; best: Episode | null } {
  const { start, end } = weekRange(now);
  const thisWeek = episodes.filter((e) => {
    if (!e.validatedAt) return false;
    const t = new Date(e.validatedAt).getTime();
    return t >= start.getTime() && t < end.getTime();
  }).length;

  const withViews = episodes.filter((e) => e.status === 'publie' && e.views !== null);
  if (withViews.length === 0) return { thisWeek, avgViews: null, best: null };
  const total = withViews.reduce((sum, e) => sum + (e.views ?? 0), 0);
  const best = withViews.reduce((a, b) => ((b.views ?? 0) > (a.views ?? 0) ? b : a));
  return { thisWeek, avgViews: Math.round(total / withViews.length), best };
}

export type Verdict = 'pas_assez' | 'prend' | 'ne_prend_pas';

export function verdict(episodes: Episode[], opts: { threshold?: number; ratio?: number; min?: number } = {}): Verdict {
  const { threshold = 10_000, ratio = 0.5, min = 3 } = opts;
  const withViews = episodes.filter((e) => e.status === 'publie' && e.views !== null);
  if (withViews.length < min) return 'pas_assez';
  const hits = withViews.filter((e) => (e.views ?? 0) >= threshold).length;
  return hits / withViews.length >= ratio ? 'prend' : 'ne_prend_pas';
}
