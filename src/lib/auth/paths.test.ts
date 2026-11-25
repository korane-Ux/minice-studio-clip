import { expect, test } from 'vitest';
import { isPublicPath } from './paths';

test('chemins publics', () => {
  expect(isPublicPath('/connexion')).toBe(true);
  expect(isPublicPath('/auth/callback')).toBe(true);
  expect(isPublicPath('/brand/minice-icon.png')).toBe(true);
  expect(isPublicPath('/')).toBe(false);
  expect(isPublicPath('/episodes/123')).toBe(false);
  expect(isPublicPath('/connexion-pirate')).toBe(false);
});
