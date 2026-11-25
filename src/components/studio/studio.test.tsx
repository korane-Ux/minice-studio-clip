import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { CopyPasteStep } from './CopyPasteStep';
import { IdeaPicker } from './IdeaPicker';
import { currentStep, Stepper } from './Stepper';

test('CopyPasteStep affiche l’erreur', async () => {
  render(<CopyPasteStep title="Script" prompt="p" onSubmit={async () => ({ ok: false, error: 'Format incorrect' })} />);
  await userEvent.type(screen.getByLabelText('Colle ici la réponse de Claude'), 'x');
  await userEvent.click(screen.getByRole('button', { name: 'Lire la réponse' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Format incorrect');
});

test('CopyPasteStep copie le texte', async () => {
  const user = userEvent.setup();
  render(<CopyPasteStep title="Script" prompt="Bonjour Claude" onSubmit={async () => ({ ok: true })} />);
  await user.click(screen.getByRole('button', { name: 'Copier le texte pour Claude' }));
  expect(await navigator.clipboard.readText()).toBe('Bonjour Claude');
  expect(screen.getByRole('button', { name: 'Texte copié ✓' })).toBeInTheDocument();
});

test('IdeaPicker renvoie l’idée choisie', async () => {
  const onPick = vi.fn();
  const ideas = [1, 2, 3, 4, 5].map((i) => ({ title: `Idée ${i}`, pitch: `Pitch ${i}`, lesson: `Leçon ${i}` }));
  render(<IdeaPicker ideas={ideas} onPick={onPick} />);
  await userEvent.click(screen.getByRole('button', { name: /Idée 3/ }));
  expect(onPick).toHaveBeenCalledWith(ideas[2]);
});

test('étape courante', () => {
  expect(currentStep('idee', false)).toBe(0);
  expect(currentStep('idee', true)).toBe(1);
  expect(currentStep('scenes', true)).toBe(2);
  expect(currentStep('montage', true)).toBe(3);
  expect(currentStep('a_valider', true)).toBe(4);
  render(<Stepper current={2} />);
  expect(screen.getByText('Scènes').closest('li')).toHaveAttribute('aria-current', 'step');
});
