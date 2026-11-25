import { beforeEach, expect, test, vi } from 'vitest';
import { fakeSupabase, type FakeOp } from '@/test/fakeSupabase';

let fake = fakeSupabase();
vi.mock('@/lib/supabase/server', () => ({
  requireUser: async () => ({ supabase: fake.client, user: { id: 'u1' } }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { rejectEpisode } from '@/app/episodes/[id]/actions';
import { markPublished } from './actions';

const scenesWithClips = (op: FakeOp) =>
  op.table === 'scenes' && op.action === 'select' ? { data: [{ clip_path: 'u1/ep1/s1.mp4' }, { clip_path: null }, { clip_path: 'u1/ep1/s3.mov' }] } : null;

beforeEach(() => {
  fake = fakeSupabase();
});

test('publier libère la place des clips mais garde la vidéo finale', async () => {
  fake = fakeSupabase((op) => {
    if (op.table === 'episodes' && op.action === 'select') return { data: { status: 'valide', video_path: 'u1/ep1.mp4' } };
    return scenesWithClips(op) ?? {};
  });
  expect(await markPublished('ep1')).toEqual({ ok: true });
  expect(fake.removed.clips).toEqual(['u1/ep1/s1.mp4', 'u1/ep1/s3.mov']);
  expect(fake.removed.videos).toBeUndefined();
  expect(fake.ops).toContainEqual({ table: 'scenes', action: 'update', values: { clip_path: null }, filters: [['episode_id', 'ep1']] });
});

test('rejeter supprime les clips et la vidéo', async () => {
  fake = fakeSupabase((op) => {
    if (op.table === 'episodes' && op.action === 'select') return { data: { status: 'a_valider', video_path: 'u1/ep1.mp4' } };
    return scenesWithClips(op) ?? {};
  });
  expect(await rejectEpisode('ep1')).toEqual({ ok: true });
  expect(fake.removed.clips).toEqual(['u1/ep1/s1.mp4', 'u1/ep1/s3.mov']);
  expect(fake.removed.videos).toEqual(['u1/ep1.mp4']);
  expect(fake.ops).toContainEqual({ table: 'episodes', action: 'update', values: { video_path: null }, filters: [['id', 'ep1']] });
});

test('publication refusée : aucun fichier supprimé', async () => {
  fake = fakeSupabase((op) => (op.table === 'episodes' && op.action === 'select' ? { data: { status: 'a_valider' } } : scenesWithClips(op) ?? {}));
  expect((await markPublished('ep1')).ok).toBe(false);
  expect(fake.removed).toEqual({});
});
