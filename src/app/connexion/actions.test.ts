import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const signInWithOtp = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: async () => ({ auth: { signInWithOtp } }),
}));

import { sendMagicLink } from './actions';

beforeEach(() => {
  signInWithOtp.mockReset();
  signInWithOtp.mockResolvedValue({ error: null });
  vi.stubEnv('ALLOWED_EMAILS', 'arthur@example.com, Autre@Example.com');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const form = (email: string) => {
  const fd = new FormData();
  fd.set('email', email);
  return fd;
};

test('refuse une adresse qui n’a pas accès, sans rien envoyer', async () => {
  expect(await sendMagicLink(form('inconnu@example.com'))).toEqual({
    ok: false,
    error: "Cette adresse n'a pas accès à Minice Studio Clip.",
  });
  expect(signInWithOtp).not.toHaveBeenCalled();
});

test('accepte une adresse autorisée quelle que soit la casse', async () => {
  expect(await sendMagicLink(form('autre@example.com'))).toEqual({ ok: true });
  expect(signInWithOtp.mock.calls[0][0].email).toBe('autre@example.com');
});

test('sans liste d’adresses, personne ne peut créer de compte', async () => {
  vi.stubEnv('ALLOWED_EMAILS', '');
  expect(await sendMagicLink(form('arthur@example.com'))).toEqual({
    ok: false,
    error: "Cette adresse n'a pas accès à Minice Studio Clip.",
  });
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
    options: { emailRedirectTo: 'http://localhost:3000/auth/callback', shouldCreateUser: true },
  });
});

test('signale une erreur d’envoi', async () => {
  signInWithOtp.mockResolvedValue({ error: { message: 'rate limit' } });
  const fd = new FormData();
  fd.set('email', 'arthur@example.com');
  expect(await sendMagicLink(fd)).toEqual({ ok: false, error: "Le lien n'a pas pu être envoyé. Réessaie dans une minute." });
});
