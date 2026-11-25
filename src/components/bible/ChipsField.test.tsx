import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { ChipsField } from './ChipsField';

test('ajoute une valeur et ignore les doublons', async () => {
  const { container } = render(<ChipsField name="coreValues" label="Valeurs" values={['Pardon']} max={12} tone="accent" />);
  await userEvent.click(screen.getByRole('button', { name: '+ Ajouter' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Nouvelle valeur' }), '  pardon {enter}');
  expect(screen.getAllByText(/pardon/i)).toHaveLength(1);

  await userEvent.click(screen.getByRole('button', { name: '+ Ajouter' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Nouvelle valeur' }), 'Foi{enter}');
  const hidden = [...container.querySelectorAll('input[type=hidden][name=coreValues]')].map((i) => (i as HTMLInputElement).value);
  expect(hidden).toEqual(['Pardon', 'Foi']);
});

test('retire une valeur', async () => {
  render(<ChipsField name="coreValues" label="Valeurs" values={['Pardon', 'Foi']} max={12} tone="accent" />);
  await userEvent.click(screen.getByRole('button', { name: 'Retirer Pardon' }));
  expect(screen.queryByText('Pardon')).toBeNull();
});

test('bloque l’ajout au-delà du maximum', () => {
  render(<ChipsField name="coreValues" label="Valeurs" values={['a', 'b']} max={2} tone="accent" />);
  expect(screen.queryByRole('button', { name: '+ Ajouter' })).toBeNull();
});
