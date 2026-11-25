import { expect, test } from 'vitest';
import { clipPath, isOwnPath, validateClipFile } from './clipFile';

test('formats de clip', () => {
  expect(validateClipFile({ name: 'a.avi', type: 'video/x-msvideo', size: 1e6 })).toEqual({ ok: false, error: 'Format refusé : MP4, WebM ou MOV uniquement.' });
  expect(validateClipFile({ name: 'a.mp4', type: 'video/mp4', size: 500 * 1024 * 1024 })).toEqual({ ok: false, error: 'Clip trop lourd : 200 Mo maximum.' });
  expect(validateClipFile({ name: 'a.MOV', type: 'video/quicktime', size: 3e7 })).toEqual({ ok: true, ext: 'mov' });
  expect(validateClipFile({ name: 'scene.webm', type: 'video/webm', size: 1e6 })).toEqual({ ok: true, ext: 'webm' });
});

test('type absent : on se fie à l’extension', () => {
  expect(validateClipFile({ name: 'clip.MP4', type: '', size: 1e6 })).toEqual({ ok: true, ext: 'mp4' });
  expect(validateClipFile({ name: 'clip.mkv', type: '', size: 1e6 }).ok).toBe(false);
});

test('chemin du clip et vérification du propriétaire', () => {
  expect(clipPath('u1', 'ep1', 'sc1', 'mp4')).toBe('u1/ep1/sc1.mp4');
  expect(isOwnPath('u1/ep1/sc1.mp4', 'u1/ep1/sc1.')).toBe(true);
  expect(isOwnPath('u2/ep1/sc1.mp4', 'u1/ep1/sc1.')).toBe(false);
  expect(isOwnPath('u1/ep1/sc1.mp4/../../u2/x.mp4', 'u1/ep1/sc1.')).toBe(false);
});
