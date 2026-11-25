import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { merAccount, parabolesAccount } from '@/lib/ai/test-fixtures';
import type { Episode } from '@/lib/domain/types';
import { EpisodeGrid } from './EpisodeGrid';
import { ModeToggle } from './ModeToggle';

function ep(id: string, accountId: string, title: string, status: Episode['status']): Episode {
  return { id, accountId, number: 1, title, idea: {}, status, lesson: '', caption: '', hashtags: [], videoPath: null, validatedAt: null, publishedAt: null, views: null, viewsUpdatedAt: null, createdAt: '2026-11-24T10:00:00Z' };
}
const epMer = ep('e1', merAccount.id, 'Le crabe qui voulait tout garder', 'scenes');
const epPar = ep('e2', parabolesAccount.id, 'Le fils qui revient', 'valide');
const accounts = [merAccount, parabolesAccount];

test('Pilote auto affiche l’avertissement', async () => {
  render(<ModeToggle />);
  expect(screen.queryByRole('status')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Pilote auto' }));
  expect(screen.getByRole('status')).toHaveTextContent('Le pilote automatique démarre dès que tes clés API sont connectées.');
});

test('filtre par compte', () => {
  render(<EpisodeGrid episodes={[epMer, epPar]} accounts={accounts} filter={merAccount.id} clips={{}} />);
  expect(screen.getByText(epMer.title)).toBeInTheDocument();
  expect(screen.queryByText(epPar.title)).toBeNull();
});

test('badges et liens', () => {
  render(<EpisodeGrid episodes={[epMer, epPar]} accounts={accounts} filter={null} clips={{ e1: { done: 2, total: 4 } }} />);
  expect(screen.getByText('Scènes 2 / 4')).toBeInTheDocument();
  expect(screen.getByText('Prêt à publier')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Le fils qui revient/ })).toHaveAttribute('href', '/publier/e2');
});

test('grille vide', () => {
  render(<EpisodeGrid episodes={[]} accounts={accounts} filter={null} clips={{}} />);
  expect(screen.getByText(/Aucun épisode pour l’instant/)).toBeInTheDocument();
});
