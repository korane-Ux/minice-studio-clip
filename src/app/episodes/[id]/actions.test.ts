import { beforeEach, expect, test, vi } from 'vitest';

const rpc = vi.fn();
const from = vi.fn(() => {
  throw new Error('aucune lecture attendue');
});
vi.mock('@/lib/supabase/server', () => ({
  requireUser: async () => ({ supabase: { rpc, from }, user: { id: 'u1' } }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { chooseIdea, importScript } from './actions';

beforeEach(() => {
  rpc.mockReset();
  from.mockClear();
});

test('réponse illisible : rien n’est envoyé à la base', async () => {
  const r = await importScript('ep1', 'blabla');
  expect(r).toEqual({ ok: false, error: "Je n'ai pas trouvé de JSON dans la réponse. Copie toute la réponse de Claude." });
  expect(rpc).not.toHaveBeenCalled();
  expect(from).not.toHaveBeenCalled();
});

test('idée incomplète refusée sans écriture', async () => {
  const r = await chooseIdea('ep1', { title: '', pitch: 'p', lesson: 'l' });
  expect(r.ok).toBe(false);
  expect(from).not.toHaveBeenCalled();
});
