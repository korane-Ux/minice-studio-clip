import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

vi.mock('./actions', () => ({ sendMagicLink: vi.fn() }));

import ConnexionPage from './page';

const renderPage = async (erreur?: string) => render(await ConnexionPage({ searchParams: Promise.resolve(erreur ? { erreur } : {}) }));

test('page de connexion : grande illustration Minice et carte de connexion', async () => {
  await renderPage();
  expect(screen.getByRole('heading', { name: 'Connecte-toi pour continuer' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Le personnage de Minice' })).toHaveAttribute('src', '/brand/minice-hero.png');
  expect(screen.getByLabelText('Ton adresse email')).toHaveAttribute('placeholder', 'Ton adresse email');
  expect(screen.getByRole('button', { name: 'Recevoir mon lien' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('lien expiré : message affiché sur la carte', async () => {
  await renderPage('lien');
  expect(screen.getByRole('alert')).toHaveTextContent("Ce lien n'est plus valable. Demande un nouveau lien.");
});
