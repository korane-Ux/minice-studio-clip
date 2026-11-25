import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { EpisodeBundle } from '@/lib/episodes/load';
import type { EpisodeStatus } from '@/lib/domain/status';
import { ctxMer, gaspard, merAccount } from '@/lib/ai/test-fixtures';

const { bundle } = vi.hoisted(() => ({ bundle: { current: null as EpisodeBundle | null } }));
const storage = {
  from: () => ({
    createSignedUrls: async (paths: string[]) => ({ data: paths.map((p) => ({ path: p, signedUrl: `https://signed/${p}` })) }),
    createSignedUrl: async (p: string) => ({ data: { signedUrl: `https://signed/${p}` } }),
  }),
};
vi.mock('@/lib/supabase/server', () => ({ requireUser: async () => ({ supabase: { storage }, user: { id: 'u1', email: 'a@b.c' } }) }));
vi.mock('@/lib/episodes/load', () => ({ loadEpisode: async () => bundle.current }));
vi.mock('next/navigation', () => ({ notFound: () => null, useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }), usePathname: () => '/episodes/ep1' }));
vi.mock('@/lib/montage/runMontage', () => ({ runMontage: vi.fn() }));
vi.mock('@/app/episodes/[id]/actions', () => ({}));
vi.mock('@/app/episodes/[id]/scene-actions', () => ({}));

import EpisodePage from './page';

function setBundle(status: EpisodeStatus) {
  const scene = (position: number, clipPath: string | null) => ({
    id: `s${position}`,
    episodeId: 'ep1',
    position,
    startS: (position - 1) * 6,
    durationS: 6,
    visual: `Visuel ${position}`,
    dialogue: '',
    characterIds: [gaspard.id],
    prompt: `Prompt ${position}`,
    clipPath,
  });
  bundle.current = {
    episode: {
      id: 'ep1', accountId: merAccount.id, number: 4, title: 'La perle', idea: {}, status, lesson: 'Partager', caption: '', hashtags: [],
      videoPath: null, validatedAt: null, publishedAt: null, views: null, viewsUpdatedAt: null, createdAt: '2026-11-25T10:00:00Z',
    },
    account: merAccount,
    characters: [gaspard],
    scenes: [scene(1, 'u1/ep1/s1.mp4'), scene(2, 'u1/ep1/s2.mp4')],
    ctx: ctxMer,
  };
}

const renderPage = async () => render(await EpisodePage({ params: Promise.resolve({ id: 'ep1' }) }));

test('au montage, chaque clip peut encore être remplacé', async () => {
  setBundle('montage');
  await renderPage();
  expect(screen.getByRole('button', { name: 'Lancer le montage' })).toBeInTheDocument();
  expect(screen.getByText('Remplacer le clip')).toBeInTheDocument();
});

test.each(['idee', 'scenes', 'montage'] as const)('épisode en cours (%s) : on peut l’abandonner', async (status) => {
  setBundle(status);
  await renderPage();
  expect(screen.getByRole('button', { name: "Abandonner l'épisode" })).toBeInTheDocument();
});

test('épisode publié : pas de bouton abandonner', async () => {
  setBundle('publie');
  await renderPage();
  expect(screen.queryByRole('button', { name: "Abandonner l'épisode" })).not.toBeInTheDocument();
});
