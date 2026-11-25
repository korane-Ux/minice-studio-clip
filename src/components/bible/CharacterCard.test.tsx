import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { CharacterCard } from './CharacterCard';

test('image trop lourde : refusée avant tout envoi', async () => {
  const onSave = vi.fn();
  const onImage = vi.fn();
  render(<CharacterCard character={null} imageUrl={null} onSave={onSave} onImage={onImage} />);
  await userEvent.type(screen.getByLabelText('Nom'), 'Gaspard');
  const big = new File([new Uint8Array(6 * 1024 * 1024)], 'g.png', { type: 'image/png' });
  await userEvent.upload(screen.getByLabelText(/Image de référence/), big);
  await userEvent.click(screen.getByRole('button', { name: 'Ajouter le personnage' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Image trop lourde : 5 Mo maximum.');
  expect(onSave).not.toHaveBeenCalled();
});

test('enregistre puis envoie l’image directement', async () => {
  const onSave = vi.fn().mockResolvedValue({ ok: true, id: 'ch1' });
  const onImage = vi.fn().mockResolvedValue({ ok: true });
  render(<CharacterCard character={null} imageUrl={null} onSave={onSave} onImage={onImage} />);
  await userEvent.type(screen.getByLabelText('Nom'), 'Gaspard');
  const img = new File([new Uint8Array(1000)], 'g.webp', { type: 'image/webp' });
  await userEvent.upload(screen.getByLabelText(/Image de référence/), img);
  await userEvent.click(screen.getByRole('button', { name: 'Ajouter le personnage' }));
  await vi.waitFor(() => expect(onImage).toHaveBeenCalledWith('ch1', img, 'webp'));
  const sent = onSave.mock.calls[0][0] as FormData;
  expect(sent.get('image')).toBeNull();
});
