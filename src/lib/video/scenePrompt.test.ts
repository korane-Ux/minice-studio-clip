import { expect, test } from 'vitest';
import { bernard, gaspard, merAccount as mer, perle } from '@/lib/ai/test-fixtures';
import { buildScenePrompt } from './scenePrompt';
import { VIDEO_TOOLS } from './tools';

test('scène 3 : continuité, ordre de la bible, durée', () => {
  const { prompt, refs } = buildScenePrompt({
    account: mer,
    position: 3,
    cast: [perle, bernard, gaspard],
    scene: { visual: 'Une vague emporte la pile.', dialogue: 'Gaspard : « Bernard ! »', durationS: 8, characters: ['Bernard', 'Gaspard'] },
  });
  expect(prompt.startsWith('La scène suit directement la précédente.')).toBe(true);
  expect(prompt).toContain('Personnages joints : 1. Gaspard (crabe rouge), 2. Bernard (petit bernard-l’ermite gris)');
  expect(prompt).toContain('Animation 3D');
  expect(prompt).toContain('plan vertical 9:16');
  expect(prompt).toContain('8 secondes');
  expect(prompt).toContain('Dialogue en français : Gaspard : « Bernard ! »');
  expect(prompt).not.toContain('Perle');
  expect(refs.map((c) => c.name)).toEqual(['Gaspard', 'Bernard']);
});

test('scène 1 sans dialogue', () => {
  const { prompt } = buildScenePrompt({
    account: mer,
    position: 1,
    cast: [gaspard],
    scene: { visual: 'Plage.', dialogue: '', durationS: 6, characters: ['Gaspard'] },
  });
  expect(prompt.startsWith('La scène suit')).toBe(false);
  expect(prompt).toContain('Pas de dialogue.');
  expect(prompt).toContain('6 secondes');
});

test('outils vidéo gratuits', () => {
  expect(VIDEO_TOOLS.map((t) => t.name)).toEqual(['Google Flow', 'Dreamina', 'Kling']);
});
