import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { MontageStep } from './MontageStep';

const scenes = [{ id: 's1', position: 1, startS: 0, durationS: 8, dialogue: 'A', clipUrl: 'https://x/s1.mp4', clipPath: 'u/e/s1.mp4' }];

test('montage en échec : message et rien d’enregistré', async () => {
  const save = vi.fn();
  render(<MontageStep lesson="Leçon" scenes={scenes} run={() => Promise.reject(new Error('OOM'))} onSave={save} />);
  await userEvent.click(screen.getByRole('button', { name: 'Lancer le montage' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Le montage a échoué. Réessaie depuis un ordinateur.');
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Lancer le montage' })).toBeEnabled();
});

test('montage réussi : la vidéo est enregistrée', async () => {
  const blob = new Blob(['x'], { type: 'video/mp4' });
  const save = vi.fn().mockResolvedValue({ ok: true });
  render(<MontageStep lesson="Leçon" scenes={scenes} run={() => Promise.resolve(blob)} onSave={save} fetchClip={async () => new Uint8Array([1])} />);
  await userEvent.click(screen.getByRole('button', { name: 'Lancer le montage' }));
  await vi.waitFor(() => expect(save).toHaveBeenCalledWith(blob));
});
