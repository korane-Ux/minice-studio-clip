import { expect, test, vi } from 'vitest';
import { fakeSupabase, type FakeOp } from '@/test/fakeSupabase';

let fake = fakeSupabase();
vi.mock('@/lib/supabase/server', () => ({
  requireUser: async () => ({ supabase: fake.client, user: { id: 'u1' } }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { registerClip } from './scene-actions';

const answers = (oldPath: string | null) => (op: FakeOp) => {
  if (op.action !== 'select') return {};
  if (op.table === 'scenes' && op.filters[0][0] === 'id') return { data: { id: 's1', episode_id: 'ep1', clip_path: oldPath } };
  if (op.table === 'episodes') return { data: { id: 'ep1', status: 'montage' } };
  if (op.table === 'scenes') return { data: [{ clip_path: 'u1/ep1/s1.mp4' }] };
  return {};
};

test('remplacer un clip .mov par un .mp4 supprime l’ancien fichier', async () => {
  fake = fakeSupabase(answers('u1/ep1/s1.mov'));
  expect((await registerClip('s1', 'u1/ep1/s1.mp4')).ok).toBe(true);
  expect(fake.removed.clips).toEqual(['u1/ep1/s1.mov']);
});

test('même chemin (fichier écrasé) : rien à supprimer', async () => {
  fake = fakeSupabase(answers('u1/ep1/s1.mp4'));
  expect((await registerClip('s1', 'u1/ep1/s1.mp4')).ok).toBe(true);
  expect(fake.removed.clips).toBeUndefined();
});
