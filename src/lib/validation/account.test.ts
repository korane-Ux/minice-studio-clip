import { expect, test } from 'vitest';
import { accountFromForm, accountUpdateSchema, characterSchema, validateRefImage } from './account';

const valid = {
  name: 'Paraboles',
  color: '#FBBF24',
  style: 'anime_2d',
  contentFocus: 'Paraboles et récits bibliques',
  tone: 'Émouvant',
  targetDurationS: 30,
  lessonFormat: 'verset',
  coreValues: ['Pardon'],
  themes: ['Paraboles de Jésus'],
  exclusions: ['Gore'],
  autopilotCadence: 3,
  autopilotConfirm: true,
  autoCheck: true,
};

test('accepte un compte valide', () => expect(accountUpdateSchema.safeParse(valid).success).toBe(true));

test('refuse une durée hors 20/30/40 et une couleur invalide', () => {
  expect(accountUpdateSchema.safeParse({ ...valid, targetDurationS: 25 }).success).toBe(false);
  expect(accountUpdateSchema.safeParse({ ...valid, color: 'violet' }).success).toBe(false);
  expect(accountUpdateSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
});

test('12 éléments maximum par liste', () => {
  expect(accountUpdateSchema.safeParse({ ...valid, coreValues: Array.from({ length: 13 }, (_, i) => `v${i}`) }).success).toBe(false);
});

test('lecture du formulaire', () => {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ name: 'Paraboles', color: '#FBBF24', style: 'anime_2d', contentFocus: 'c', tone: 't', targetDurationS: '40', lessonFormat: 'verset', autopilotCadence: '2', autopilotConfirm: 'false', autoCheck: 'true' })) fd.set(k, v);
  fd.append('coreValues', 'Pardon');
  fd.append('coreValues', 'Foi');
  const r = accountUpdateSchema.safeParse(accountFromForm(fd));
  expect(r.success).toBe(true);
  if (r.success) {
    expect(r.data.targetDurationS).toBe(40);
    expect(r.data.coreValues).toEqual(['Pardon', 'Foi']);
    expect(r.data.themes).toEqual([]);
    expect(r.data.autopilotConfirm).toBe(false);
  }
});

test('personnage', () => {
  expect(characterSchema.safeParse({ name: 'Le père', description: 'Âgé', color: '#D9B98B' }).success).toBe(true);
  expect(characterSchema.safeParse({ name: '', description: '', color: '#D9B98B' }).success).toBe(false);
});

test('image de référence', () => {
  expect(validateRefImage({ type: 'image/gif', size: 1000 })).toEqual({ ok: false, error: 'Image refusée : PNG, JPEG ou WebP uniquement.' });
  expect(validateRefImage({ type: 'image/png', size: 6 * 1024 * 1024 })).toEqual({ ok: false, error: 'Image trop lourde : 5 Mo maximum.' });
  expect(validateRefImage({ type: 'image/webp', size: 200_000 })).toEqual({ ok: true, ext: 'webp' });
});
