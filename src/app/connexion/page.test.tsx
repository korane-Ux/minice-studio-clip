import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

vi.mock('./actions', () => ({ sendMagicLink: vi.fn(), signInWithPassword: vi.fn() }));

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

test('on peut passer à la connexion par mot de passe', async () => {
  await renderPage();
  await userEvent.click(screen.getByRole('button', { name: 'Avec un mot de passe' }));
  expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
  expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Avec un lien par email' }));
  expect(screen.queryByLabelText('Mot de passe')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Recevoir mon lien' })).toBeInTheDocument();
});
