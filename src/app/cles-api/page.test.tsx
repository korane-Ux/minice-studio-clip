import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import ClesApiPage from './page';

test('aucun champ de clé en V1', () => {
  render(<ClesApiPage />);
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByText(/mode Pas à pas/)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Clés API' })).toBeInTheDocument();
});
