import { expect, test } from 'vitest';
import { parseViews, shareText } from './views';

const ERR = { ok: false, error: 'Indique un nombre de vues (chiffres uniquement).' };

test('saisie des vues', () => {
  expect(parseViews('12 500')).toEqual({ ok: true, value: 12500 });
  expect(parseViews('12 500')).toEqual({ ok: true, value: 12500 });
  expect(parseViews('12.500')).toEqual({ ok: true, value: 12500 });
  expect(parseViews('0')).toEqual({ ok: true, value: 0 });
  expect(parseViews('-3')).toEqual(ERR);
  expect(parseViews('')).toEqual(ERR);
  expect(parseViews('12k')).toEqual(ERR);
  expect(parseViews('99999999999')).toEqual(ERR);
});

test('texte à copier', () => {
  expect(shareText('Mamie Mangue ne peut plus payer son loyer.', ['#histoire', '#famille'])).toBe('Mamie Mangue ne peut plus payer son loyer.\n\n#histoire #famille');
  expect(shareText('Légende', [])).toBe('Légende');
});
