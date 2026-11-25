import { expect, test } from 'vitest';
import type { ScriptDraft } from '@/lib/ai/schemas';
import { ctxMer, gaspard } from '@/lib/ai/test-fixtures';
import { toImportPayload } from './importPayload';

const draft4x8: ScriptDraft = {
  title: 'Le crabe qui voulait tout garder',
  lesson: 'Celui qui partage ne perd jamais rien.',
  caption: 'Gaspard garde tout pour lui...',
  hashtags: ['#fable', '#partage', '#leçondevie'],
  scenes: [1, 2, 3, 4].map((i) => ({ visual: `Plan ${i}`, dialogue: i === 2 ? '' : 'Gaspard : « À moi ! »', durationS: 8, characters: ['Gaspard'] })),
};

test('toImportPayload calcule les débuts et les prompts', () => {
  const r = toImportPayload(draft4x8, ctxMer);
  expect(r.ok).toBe(true);
  if (r.ok) {
    expect(r.payload.title).toBe(draft4x8.title);
    expect(r.payload.scenes.map((s) => s.position)).toEqual([1, 2, 3, 4]);
    expect(r.payload.scenes.map((s) => s.start_s)).toEqual([0, 8, 16, 24]);
    expect(r.payload.scenes[0].prompt.startsWith('La scène suit')).toBe(false);
    expect(r.payload.scenes[2].prompt.startsWith('La scène suit directement la précédente.')).toBe(true);
    expect(r.payload.scenes[0].character_ids).toEqual([gaspard.id]);
  }
});

test('personnage inconnu', () => {
  const bad = { ...draft4x8, scenes: draft4x8.scenes.map((s) => ({ ...s, characters: ['Médor'] })) };
  expect(toImportPayload(bad, ctxMer)).toEqual({ ok: false, error: 'Personnage inconnu : Médor. Ajoute-le dans la bible ou corrige la réponse.' });
});

test('noms reconnus sans tenir compte des majuscules', () => {
  const r = toImportPayload({ ...draft4x8, scenes: draft4x8.scenes.map((s) => ({ ...s, characters: ['gaspard'] })) }, ctxMer);
  expect(r.ok).toBe(true);
});
