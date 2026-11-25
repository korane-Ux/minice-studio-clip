import { render, screen } from '@testing-library/react';
import { RailNav } from './RailNav';

test('affiche les 6 entrées dans l’ordre avec leurs liens', () => {
  render(<RailNav active="comptes" />);
  const links = screen.getAllByRole('link').filter((l) => l.textContent);
  expect(links.map((l) => l.textContent)).toEqual(['Créer', 'Épisodes', 'Studio', 'Comptes', 'Publier', 'Clés API']);
  expect(links.map((l) => l.getAttribute('href'))).toEqual(['/', '/?vue=episodes', '/studio', '/comptes', '/publier', '/cles-api']);
});

test('marque l’entrée active et affiche le badge GRATUIT', () => {
  render(<RailNav active="comptes" />);
  expect(screen.getByRole('link', { name: 'Comptes' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Créer' })).not.toHaveAttribute('aria-current');
  expect(screen.getByText('GRATUIT')).toBeInTheDocument();
});
