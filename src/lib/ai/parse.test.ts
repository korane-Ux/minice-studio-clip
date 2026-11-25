import { expect, test } from 'vitest';
import { parseAiResponse } from './parse';
import { ideasSchema, scriptSchema, summarySchema } from './schemas';

const ok = {
  title: 'Le crabe',
  lesson: 'Celui qui partage ne perd jamais rien.',
  caption: 'c',
  hashtags: ['#fable', '#leçondevie', '#partage'],
  scenes: [8, 8, 8, 8].map((d) => ({ visual: 'v', dialogue: 'Gaspard : « Tout ça est à moi. »', durationS: d, characters: ['Gaspard'] })),
};

test('lit un bloc json entouré de texte', () => {
  const raw = 'Voici le script :\n```json\n' + JSON.stringify(ok) + '\n```\nBonne création !';
  expect(parseAiResponse(raw, scriptSchema)).toEqual({ ok: true, data: ok });
});

test('lit un json sans bloc de code', () => {
  expect(parseAiResponse('Voilà : ' + JSON.stringify(ok) + ' Fin.', scriptSchema)).toEqual({ ok: true, data: ok });
});

test('tolère une virgule en trop', () => {
  const raw = '```json\n{"summary": "Gaspard a appris à partager.",}\n```';
  expect(parseAiResponse(raw, summarySchema)).toEqual({ ok: true, data: { summary: 'Gaspard a appris à partager.' } });
});

test('garde les guillemets français dans le texte', () => {
  const raw = '```json\n{"summary": "Gaspard dit « merci »."}\n```';
  expect(parseAiResponse(raw, summarySchema)).toEqual({ ok: true, data: { summary: 'Gaspard dit « merci ».' } });
});

test('aucun json', () => {
  expect(parseAiResponse('Désolé, je ne peux pas.', scriptSchema)).toEqual({
    ok: false,
    error: "Je n'ai pas trouvé de JSON dans la réponse. Copie toute la réponse de Claude.",
  });
});

test('json cassé', () => {
  const r = parseAiResponse('```json\n{"summary": "a" "b"}\n```', summarySchema);
  expect(r).toEqual({ ok: false, error: "La réponse de Claude est coupée ou mal formée. Copie toute la réponse, du début à la fin." });
});

test('trop de scènes', () => {
  const bad = { ...ok, scenes: [...ok.scenes, ...ok.scenes.slice(0, 2)].map((s) => ({ ...s, durationS: 5 })) };
  const r = parseAiResponse(JSON.stringify(bad), scriptSchema);
  expect(r.ok).toBe(false);
  if (!r.ok) {
    expect(r.error).toContain('scenes');
    expect(r.error.startsWith('La réponse ne respecte pas le format : ')).toBe(true);
  }
});

test('durée totale hors 20 à 40 secondes', () => {
  const bad = { ...ok, scenes: ok.scenes.slice(0, 3).map((s) => ({ ...s, durationS: 5 })) };
  expect(parseAiResponse(JSON.stringify(bad), scriptSchema).ok).toBe(false);
});

test('scène de plus de 8 secondes', () => {
  const bad = { ...ok, scenes: ok.scenes.map((s, i) => (i === 0 ? { ...s, durationS: 9 } : { ...s, durationS: 7 })) };
  expect(parseAiResponse(JSON.stringify(bad), scriptSchema).ok).toBe(false);
});

test('hashtag sans #', () => {
  expect(parseAiResponse(JSON.stringify({ ...ok, hashtags: ['fable', '#a', '#b'] }), scriptSchema).ok).toBe(false);
});

test('exactement 5 idées', () => {
  const idee = { title: 't', pitch: 'p', lesson: 'l' };
  expect(parseAiResponse(JSON.stringify({ ideas: [idee, idee, idee, idee] }), ideasSchema).ok).toBe(false);
  expect(parseAiResponse(JSON.stringify({ ideas: [idee, idee, idee, idee, idee] }), ideasSchema).ok).toBe(true);
});
