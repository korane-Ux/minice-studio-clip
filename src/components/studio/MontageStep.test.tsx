import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { MontageClipError } from '@/lib/montage/errors';
import { MontageStep } from './MontageStep';

const scenes = [
  { id: 's1', position: 1, startS: 0, durationS: 8, dialogue: 'A', clipUrl: 'https://x/s1.mp4', clipPath: 'u/e/s1.mp4' },
  { id: 's2', position: 2, startS: 8, durationS: 5, dialogue: 'B', clipUrl: 'https://x/s2.mov', clipPath: 'u/e/s2.mov' },
];
const okFetch = async () => new Uint8Array([1]);

test('montage en échec : message et rien d’enregistré', async () => {
  const save = vi.fn();
  render(<MontageStep lesson="Leçon" scenes={scenes} run={() => Promise.reject(new Error('OOM'))} onSave={save} fetchClip={okFetch} />);
  await userEvent.click(screen.getByRole('button', { name: 'Lancer le montage' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Le montage a échoué. Réessaie depuis un ordinateur.');
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Lancer le montage' })).toBeEnabled();
});

test('montage réussi : la vidéo est enregistrée', async () => {
  const blob = new Blob(['x'], { type: 'video/mp4' });
  const save = vi.fn().mockResolvedValue({ ok: true });
  render(<MontageStep lesson="Leçon" scenes={scenes} run={() => Promise.resolve(blob)} onSave={save} fetchClip={okFetch} />);
  await userEvent.click(screen.getByRole('button', { name: 'Lancer le montage' }));
  await vi.waitFor(() => expect(save).toHaveBeenCalledWith(blob));
});

test('chaque clip part au montage avec sa durée prévue et sa scène', async () => {
  const run = vi.fn().mockResolvedValue(new Blob(['x']));
  render(<MontageStep lesson="Leçon" scenes={scenes} run={run} onSave={async () => ({ ok: true })} fetchClip={okFetch} />);
  await userEvent.click(screen.getByRole('button', { name: 'Lancer le montage' }));
  await vi.waitFor(() => expect(run).toHaveBeenCalled());
  expect(run.mock.calls[0][0]).toEqual([
    { name: 'scene1.mp4', data: new Uint8Array([1]), durationS: 8, position: 1 },
    { name: 'scene2.mov', data: new Uint8Array([1]), durationS: 5, position: 2 },
  ]);
});

test('clip illisible : la scène à remplacer est nommée', async () => {
  render(
    <MontageStep lesson="Leçon" scenes={scenes} run={() => Promise.reject(new MontageClipError(2))} onSave={vi.fn()} fetchClip={okFetch} />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Lancer le montage' }));
  expect(await screen.findByRole('alert')).toHaveTextContent("Le clip de la scène 2 n'a pas pu être lu. Remplace-le, puis relance le montage.");
});

test('clip impossible à télécharger : la scène est nommée', async () => {
  const fetchClip = vi.fn(async (url: string) => {
    if (url.endsWith('s2.mov')) throw new Error('403');
    return new Uint8Array([1]);
  });
  const run = vi.fn();
  render(<MontageStep lesson="Leçon" scenes={scenes} run={run} onSave={vi.fn()} fetchClip={fetchClip} />);
  await userEvent.click(screen.getByRole('button', { name: 'Lancer le montage' }));
  expect(await screen.findByRole('alert')).toHaveTextContent("Le clip de la scène 2 n'a pas pu être téléchargé. Recharge la page, puis relance le montage.");
  expect(run).not.toHaveBeenCalled();
});
