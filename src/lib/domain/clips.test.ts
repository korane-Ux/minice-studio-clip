import { expect, test } from 'vitest';
import { statusAfterClips } from './clips';

const withClips = (...present: boolean[]) => present.map((p) => ({ clipPath: p ? 'x.mp4' : null }));

test('le dernier clip fait passer au montage', () => expect(statusAfterClips('scenes', withClips(true, true, true, true))).toBe('montage'));
test('il manque un clip', () => expect(statusAfterClips('scenes', withClips(true, false, true))).toBe('scenes'));
test('retirer un clip en montage revient aux scènes', () => expect(statusAfterClips('montage', withClips(true, false))).toBe('scenes'));
test('pas de scène : reste aux scènes', () => expect(statusAfterClips('scenes', [])).toBe('scenes'));
test('épisode à valider : refusé', () => expect(() => statusAfterClips('a_valider', withClips(true))).toThrow());
