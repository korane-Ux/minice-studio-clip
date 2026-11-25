import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

const { rejectEpisode, redoScene } = vi.hoisted(() => ({ rejectEpisode: vi.fn(), redoScene: vi.fn() }));
vi.mock('@/app/episodes/[id]/actions', () => ({ rejectEpisode, redoScene, approveEpisode: vi.fn(), saveVideo: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
vi.mock('@/lib/montage/runMontage', () => ({ runMontage: vi.fn() }));

import { AbandonEpisode } from './AbandonEpisode';
import { ValidationStep } from './ValidationStep';

const scenes = [
  { id: 's1', position: 1 },
  { id: 's2', position: 2 },
];

beforeEach(() => {
  rejectEpisode.mockReset().mockResolvedValue({ ok: true });
  redoScene.mockReset().mockResolvedValue({ ok: true });
});

test('rejeter demande une confirmation', async () => {
  render(<ValidationStep episodeId="ep1" videoUrl={null} scenes={scenes} />);
  await userEvent.click(screen.getByRole('button', { name: "Rejeter l'épisode" }));
  expect(rejectEpisode).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Oui, rejeter' }));
  await vi.waitFor(() => expect(rejectEpisode).toHaveBeenCalledWith('ep1'));
});

test('refaire une scène demande une confirmation', async () => {
  render(<ValidationStep episodeId="ep1" videoUrl={null} scenes={scenes} />);
  await userEvent.selectOptions(screen.getByLabelText('Refaire la scène'), 's2');
  await userEvent.click(screen.getByRole('button', { name: 'Refaire cette scène' }));
  expect(redoScene).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Oui, refaire la scène 2' }));
  await vi.waitFor(() => expect(redoScene).toHaveBeenCalledWith('ep1', 's2'));
});

test('abandonner un épisode en cours, après confirmation', async () => {
  render(<AbandonEpisode episodeId="ep1" />);
  await userEvent.click(screen.getByRole('button', { name: "Abandonner l'épisode" }));
  expect(rejectEpisode).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Oui, abandonner' }));
  await vi.waitFor(() => expect(rejectEpisode).toHaveBeenCalledWith('ep1'));
});

test('abandon refusé : le message s’affiche', async () => {
  rejectEpisode.mockResolvedValue({ ok: false, error: "Cette action n'est pas possible à cette étape." });
  render(<AbandonEpisode episodeId="ep1" />);
  await userEvent.click(screen.getByRole('button', { name: "Abandonner l'épisode" }));
  await userEvent.click(screen.getByRole('button', { name: 'Oui, abandonner' }));
  expect(await screen.findByRole('alert')).toHaveTextContent("Cette action n'est pas possible à cette étape.");
});
