import { beforeEach, expect, test, vi } from 'vitest';
import { ctxMer, merAccount as mer } from '@/lib/ai/test-fixtures';

const rpc = vi.fn();
vi.mock('@/lib/supabase/server', () => ({ requireUser: async () => ({ supabase: { rpc }, user: { id: 'u1' } }) }));
vi.mock('@/lib/episodes/load', () => ({ loadAccountContext: async () => ctxMer }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { importBatch } from './actions';

const ep = (title: string, duration = 8) => ({
  title,
  lesson: 'Celui qui partage ne perd jamais rien.',
  caption: 'Légende',
  hashtags: ['#fable', '#partage', '#leçondevie'],
  scenes: [1, 2, 3].map((i) => ({ visual: `Plan ${i}`, dialogue: '', durationS: duration, characters: ['Gaspard'] })),
});

beforeEach(() => {
  rpc.mockReset();
  rpc.mockResolvedValue({ data: 3, error: null });
});

test('import de 3 épisodes', async () => {
  const raw = '```json\n' + JSON.stringify({ episodes: [ep('E1'), ep('E2'), ep('E3')] }) + '\n```';
  expect(await importBatch(mer.id, raw)).toEqual({ ok: true, created: 3 });
  expect(rpc).toHaveBeenCalledWith('import_batch', expect.objectContaining({ p_account_id: mer.id }));
  const payload = rpc.mock.calls[0][1].p_payload;
  expect(payload.episodes).toHaveLength(3);
  expect(payload.episodes[1].scenes.map((s: { start_s: number }) => s.start_s)).toEqual([0, 8, 16]);
});

test('un épisode invalide bloque tout le lot', async () => {
  const raw = JSON.stringify({ episodes: [ep('E1'), ep('E2', 12), ep('E3')] });
  const r = await importBatch(mer.id, raw);
  expect(r).toEqual({ ok: false, error: expect.stringMatching(/^Épisode 2 du lot : /) });
  expect(rpc).not.toHaveBeenCalled();
});

test('personnage inconnu dans un épisode du lot', async () => {
  const bad = { ...ep('E3'), scenes: ep('E3').scenes.map((s) => ({ ...s, characters: ['Médor'] })) };
  const r = await importBatch(mer.id, JSON.stringify({ episodes: [ep('E1'), ep('E2'), bad] }));
  expect(r).toEqual({ ok: false, error: 'Épisode 3 du lot : Personnage inconnu : Médor. Ajoute-le dans la bible ou corrige la réponse.' });
});
