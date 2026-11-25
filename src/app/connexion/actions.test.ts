import { beforeEach, expect, test, vi } from 'vitest';

const signInWithOtp = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: async () => ({ auth: { signInWithOtp } }),
}));

import { sendMagicLink } from './actions';

beforeEach(() => {
  signInWithOtp.mockReset();
  signInWithOtp.mockResolvedValue({ error: null });
});

test('refuse une adresse invalide', async () => {
  const fd = new FormData();
  fd.set('email', 'arthur@');
  expect(await sendMagicLink(fd)).toEqual({ ok: false, error: 'Adresse email invalide.' });
  expect(signInWithOtp).not.toHaveBeenCalled();
});

test('envoie le lien avec la bonne adresse de retour', async () => {
  const fd = new FormData();
  fd.set('email', '  arthur@example.com ');
  expect(await sendMagicLink(fd)).toEqual({ ok: true });
  expect(signInWithOtp).toHaveBeenCalledWith({
    email: 'arthur@example.com',
    options: { emailRedirectTo: 'http://localhost:3000/auth/callback' },
  });
});

test('signale une erreur d’envoi', async () => {
  signInWithOtp.mockResolvedValue({ error: { message: 'rate limit' } });
  const fd = new FormData();
  fd.set('email', 'arthur@example.com');
  expect(await sendMagicLink(fd)).toEqual({ ok: false, error: "Le lien n'a pas pu être envoyé. Réessaie dans une minute." });
});
