import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { ConfirmButton } from './ConfirmButton';

test('premier clic : demande confirmation sans agir', async () => {
  const onConfirm = vi.fn();
  render(<ConfirmButton label="Rejeter l'épisode" confirmLabel="Oui, rejeter" question="Les clips et la vidéo seront supprimés." onConfirm={onConfirm} />);
  await userEvent.click(screen.getByRole('button', { name: "Rejeter l'épisode" }));
  expect(onConfirm).not.toHaveBeenCalled();
  expect(screen.getByText('Les clips et la vidéo seront supprimés.')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Oui, rejeter' }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test('annuler revient au bouton de départ', async () => {
  const onConfirm = vi.fn();
  render(<ConfirmButton label="Supprimer" confirmLabel="Oui, supprimer" question="Supprimer ce personnage ?" onConfirm={onConfirm} />);
  await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
  await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
  expect(onConfirm).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument();
});
