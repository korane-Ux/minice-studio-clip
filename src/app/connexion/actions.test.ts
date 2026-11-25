import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const { signInWithOtp, signInWithPassword, rpc, redirect } = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  signInWithPassword: vi.fn(),
  rpc: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: async () => ({ auth: { signInWithOtp, signInWithPassword }, rpc }),
}));
vi.mock('next/navigation', () => ({ redirect }));

import { sendMagicLink, signInWithPassword as signInWithPassword_ } from './actions';

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

describe('connexion avec mot de passe', () => {
  const pwForm = (email: string, password: string) => {
    const fd = new FormData();
    fd.set('email', email);
    fd.set('password', password);
    return fd;
  };

  beforeEach(() => {
    signInWithPassword.mockReset().mockResolvedValue({ error: null });
    rpc.mockReset().mockResolvedValue({ data: 3, error: null });
    redirect.mockReset();
  });

  test('bon mot de passe : comptes créés puis accueil', async () => {
    await signInWithPassword_(pwForm(' Arthur@example.com ', 'un-mot-de-passe'));
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'arthur@example.com', password: 'un-mot-de-passe' });
    expect(rpc).toHaveBeenCalledWith('seed_default_accounts');
    expect(redirect).toHaveBeenCalledWith('/');
  });

  test('mauvais mot de passe : message clair, pas de redirection', async () => {
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    expect(await signInWithPassword_(pwForm('arthur@example.com', 'faux-mot-de-passe'))).toEqual({
      ok: false,
      error: 'Email ou mot de passe incorrect.',
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  test('adresse non autorisée : refusée sans appeler Supabase', async () => {
    expect(await signInWithPassword_(pwForm('inconnu@example.com', 'un-mot-de-passe'))).toEqual({
      ok: false,
      error: "Cette adresse n'a pas accès à Minice Studio Clip.",
    });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  test('mot de passe vide : refusé', async () => {
    expect((await signInWithPassword_(pwForm('arthur@example.com', ''))).ok).toBe(false);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});
