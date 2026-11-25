import { expect, test } from 'vitest';
import { batchStep, ideasStep, scriptStep, summaryStep } from '../steps';
import { ctxMer, idea, paraboles } from '../test-fixtures';

const COMMON = ['en français', '9:16', 'accroche dans les 2 premières secondes', 'Réponds uniquement avec un bloc ```json'];

test('le prompt de script contient la bible et les règles', () => {
  const p = scriptStep.buildPrompt({ ctx: paraboles, idea });
  for (const s of ['Paraboles', 'Anime 2D', 'Pardon', 'Adultère', 'Le père', 'Patient et aimant', 'Louis Segond 1910', 'référence', ...COMMON]) {
    expect(p).toContain(s);
  }
  expect(p).toContain(idea.pitch);
  expect(p).toContain('Le fils cadet a quitté la maison');
});

test('le prompt d’idées demande 5 idées et reprend l’indication', () => {
  const p = ideasStep.buildPrompt({ ctx: { ...paraboles, summary: '' }, hint: 'le fils prodigue' });
  expect(p).toContain('5 idées');
  expect(p).toContain('le fils prodigue');
  expect(p).toContain('Début du feuilleton');
});

test('sans verset, pas de consigne biblique', () => {
  const p = scriptStep.buildPrompt({ ctx: ctxMer, idea });
  expect(p).toContain('Animation 3D');
  expect(p).not.toContain('Louis Segond');
  expect(p).toContain('dite par un personnage');
});

test('résumé et lot', () => {
  const script = { title: 'T', lesson: 'L', caption: 'C', hashtags: ['#a', '#b', '#c'], scenes: [] };
  expect(summaryStep.buildPrompt({ ctx: paraboles, script })).toContain('1200 caractères');
  const lot = batchStep.buildPrompt({ ctx: ctxMer, count: 3 });
  expect(lot).toContain('3 épisodes');
  for (const s of COMMON) expect(lot).toContain(s);
});
