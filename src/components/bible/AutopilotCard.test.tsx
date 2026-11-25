import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { parabolesAccount as paraboles } from '@/lib/ai/test-fixtures';
import { AutopilotCard } from './AutopilotCard';

test('sans clés : badge et réglage de validation', async () => {
  const { container } = render(<AutopilotCard account={paraboles} hasApiKeys={false} />);
  expect(screen.getByText('Clés requises')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Toujours confirmer' })).toHaveAttribute('aria-pressed', 'true');

  await userEvent.click(screen.getByRole('button', { name: 'Sans confirmation' }));
  expect(screen.getByRole('button', { name: 'Sans confirmation' })).toHaveAttribute('aria-pressed', 'true');
  expect((container.querySelector('input[name=autopilotConfirm]') as HTMLInputElement).value).toBe('false');
});

test('contrôle automatique activé par défaut et désactivable', async () => {
  const { container } = render(<AutopilotCard account={paraboles} hasApiKeys={false} />);
  const toggle = screen.getByRole('switch', { name: 'Contrôle automatique' });
  expect(toggle).toHaveAttribute('aria-checked', 'true');
  await userEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-checked', 'false');
  expect((container.querySelector('input[name=autoCheck]') as HTMLInputElement).value).toBe('false');
});
