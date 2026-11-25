import { expect, test } from 'vitest';
import { InvalidTransitionError, statusLabel, transition, type EpisodeStatus } from './status';

test('parcours normal', () => {
  let s: EpisodeStatus = 'idee';
  s = transition(s, { type: 'SCRIPT_IMPORTED' });
  expect(s).toBe('scenes');
  s = transition(s, { type: 'CLIPS_CHANGED', allPresent: true });
  expect(s).toBe('montage');
  s = transition(s, { type: 'VIDEO_ASSEMBLED' });
  expect(s).toBe('a_valider');
  s = transition(s, { type: 'APPROVED' });
  expect(s).toBe('valide');
  expect(transition(s, { type: 'PUBLISHED' })).toBe('publie');
});

test('retirer un clip en montage revient aux scènes', () => {
  expect(transition('montage', { type: 'CLIPS_CHANGED', allPresent: false })).toBe('scenes');
  expect(transition('scenes', { type: 'CLIPS_CHANGED', allPresent: false })).toBe('scenes');
});

test('refaire une scène renvoie aux scènes', () => expect(transition('a_valider', { type: 'REDO_SCENE' })).toBe('scenes'));

test('rejet possible avant validation seulement', () => {
  for (const s of ['idee', 'scenes', 'montage', 'a_valider'] as const) expect(transition(s, { type: 'REJECTED' })).toBe('rejete');
  expect(() => transition('valide', { type: 'REJECTED' })).toThrow(InvalidTransitionError);
});

test('on ne publie pas un épisode non validé', () => expect(() => transition('a_valider', { type: 'PUBLISHED' })).toThrow(InvalidTransitionError));

test('libellés', () => {
  expect(statusLabel('idee').label).toBe('Script à préparer');
  expect(statusLabel('scenes', { done: 2, total: 4 }).label).toBe('Scènes 2 / 4');
  expect(statusLabel('montage').label).toBe('Prêt pour le montage');
  expect(statusLabel('a_valider')).toEqual({ label: 'À valider', tone: 'attente' });
  expect(statusLabel('valide')).toEqual({ label: 'Prêt à publier', tone: 'pret' });
  expect(statusLabel('publie')).toEqual({ label: 'Publié', tone: 'publie' });
  expect(statusLabel('rejete')).toEqual({ label: 'Rejeté', tone: 'rejete' });
});
