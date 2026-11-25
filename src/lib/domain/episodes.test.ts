import { expect, test } from 'vitest';
import { displayName, episodeHref, nextEpisodeNumber } from './episodes';

test('numérotation', () => {
  expect(nextEpisodeNumber([])).toBe(1);
  expect(nextEpisodeNumber([1, 2, 4])).toBe(5);
});

test('liens des cartes', () => {
  expect(episodeHref({ id: 'e1', status: 'valide' })).toBe('/publier/e1');
  expect(episodeHref({ id: 'e3', status: 'publie' })).toBe('/publier/e3');
  expect(episodeHref({ id: 'e2', status: 'scenes' })).toBe('/episodes/e2');
});

test('prénom affiché', () => {
  expect(displayName({ email: 'arthur.dupont@gmail.com', user_metadata: {} })).toBe('Arthur');
  expect(displayName({ email: 'x@y.fr', user_metadata: { first_name: 'Arthur' } })).toBe('Arthur');
  expect(displayName({ email: undefined, user_metadata: {} })).toBe('toi');
});
