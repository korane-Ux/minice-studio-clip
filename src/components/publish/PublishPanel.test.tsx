import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { PublishPanel } from './PublishPanel';

const base = { id: 'e2', title: 'Le loyer de Mamie Mangue', number: 2, caption: 'Mamie Mangue ne peut plus payer son loyer.', hashtags: ['#histoire'], views: null };

test('publication bloquée sans label IA', async () => {
  const onPublish = vi.fn().mockResolvedValue({ ok: true });
  render(<PublishPanel episode={{ ...base, status: 'valide' }} accountName="Le Marché" videoUrl="https://x" onPublish={onPublish} onViews={vi.fn()} />);
  const btn = screen.getByRole('button', { name: 'Marquer comme publié' });
  expect(btn).toBeDisabled();
  await userEvent.click(screen.getByRole('checkbox', { name: /label « Contenu généré par IA »/ }));
  expect(btn).toBeEnabled();
  await userEvent.click(btn);
  expect(onPublish).toHaveBeenCalled();
  expect(await screen.findByRole('status')).toHaveTextContent('Publié. Reviens dans 24 h pour noter les vues de cet épisode.');
});

test('saisie des vues d’un épisode publié', async () => {
  const onViews = vi.fn().mockResolvedValue({ ok: false, error: 'Indique un nombre de vues (chiffres uniquement).' });
  render(<PublishPanel episode={{ ...base, status: 'publie' }} accountName="Le Marché" videoUrl="https://x" onPublish={vi.fn()} onViews={onViews} />);
  expect(screen.queryByRole('button', { name: 'Marquer comme publié' })).toBeNull();
  await userEvent.type(screen.getByLabelText('Nombre de vues'), 'beaucoup');
  await userEvent.click(screen.getByRole('button', { name: 'Enregistrer les vues' }));
  expect(onViews).toHaveBeenCalledWith('beaucoup');
  expect(await screen.findByRole('alert')).toHaveTextContent('Indique un nombre de vues');
});
