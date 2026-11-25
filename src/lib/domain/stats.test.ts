import { expect, test } from 'vitest';
import { accountStats, verdict, weekRange } from './stats';
import type { Episode } from './types';

function pub(number: number, views: number | null, validatedAt = '2026-11-24T10:00:00Z'): Episode {
  return {
    id: `e${number}`,
    accountId: 'a1',
    number,
    title: `Épisode ${number}`,
    idea: {},
    status: 'publie',
    lesson: '',
    caption: '',
    hashtags: [],
    videoPath: null,
    validatedAt,
    publishedAt: validatedAt,
    views,
    viewsUpdatedAt: null,
    createdAt: validatedAt,
  };
}

test('semaine de Paris (lundi à lundi)', () => {
  const { start, end } = weekRange(new Date('2026-11-25T23:30:00Z'));
  expect(start.toISOString()).toBe('2026-11-22T23:00:00.000Z');
  expect(end.toISOString()).toBe('2026-11-29T23:00:00.000Z');
});

test('un dimanche soir reste dans la semaine en cours', () => {
  const { start } = weekRange(new Date('2026-11-29T22:30:00Z'));
  expect(start.toISOString()).toBe('2026-11-22T23:00:00.000Z');
});

test('moyenne et meilleur épisode', () => {
  const eps = [pub(1, 4000), pub(2, 12000), pub(3, null)];
  const s = accountStats(eps, new Date('2026-11-25T12:00:00Z'));
  expect(s.avgViews).toBe(8000);
  expect(s.best?.number).toBe(2);
});

test('épisodes de la semaine = validés cette semaine', () => {
  const eps = [pub(1, null, '2026-11-24T10:00:00Z'), pub(2, null, '2026-11-20T10:00:00Z')];
  expect(accountStats(eps, new Date('2026-11-25T12:00:00Z')).thisWeek).toBe(1);
});

test('sans vues saisies', () => {
  const s = accountStats([pub(1, null)], new Date('2026-11-25T12:00:00Z'));
  expect(s.avgViews).toBeNull();
  expect(s.best).toBeNull();
});

test('verdict', () => {
  expect(verdict([pub(1, 20000), pub(2, 15000)])).toBe('pas_assez');
  expect(verdict([pub(1, 20000), pub(2, 15000), pub(3, 900)])).toBe('prend');
  expect(verdict([pub(1, 20000), pub(2, 800), pub(3, 900)])).toBe('ne_prend_pas');
  expect(verdict([pub(1, 20000), pub(2, 800), pub(3, null)])).toBe('pas_assez');
});
