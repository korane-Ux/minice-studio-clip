// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, expect, test, vi } from 'vitest';

const exchangeCodeForSession = vi.fn();
const verifyOtp = vi.fn();
const rpc = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: async () => ({ auth: { exchangeCodeForSession, verifyOtp }, rpc }),
}));

import { GET as callback } from './callback/route';
import { GET as confirm } from './confirm/route';

const req = (path: string) => new NextRequest(`http://localhost:3000${path}`);
const target = (res: Response) => res.headers.get('location');

beforeEach(() => {
  exchangeCodeForSession.mockReset().mockResolvedValue({ error: null });
  verifyOtp.mockReset().mockResolvedValue({ error: null });
  rpc.mockReset().mockResolvedValue({ data: 3, error: null });
});

test('callback : session ouverte et comptes créés, retour à l’accueil', async () => {
  expect(target(await callback(req('/auth/callback?code=abc')))).toBe('http://localhost:3000/');
  expect(rpc).toHaveBeenCalledWith('seed_default_accounts');
});

test('callback : si la création des comptes échoue, on passe par /comptes qui réessaie', async () => {
  rpc.mockResolvedValue({ data: null, error: { message: 'permission denied' } });
  expect(target(await callback(req('/auth/callback?code=abc')))).toBe('http://localhost:3000/comptes');
});

test('confirm : vérifie le jeton sans dépendre du navigateur d’origine', async () => {
  const res = await confirm(req('/auth/confirm?token_hash=th1&type=email'));
  expect(verifyOtp).toHaveBeenCalledWith({ type: 'email', token_hash: 'th1' });
  expect(rpc).toHaveBeenCalledWith('seed_default_accounts');
  expect(target(res)).toBe('http://localhost:3000/');
});

test('confirm : jeton manquant ou expiré, retour à la connexion', async () => {
  expect(target(await confirm(req('/auth/confirm?type=email')))).toBe('http://localhost:3000/connexion?erreur=lien');
  verifyOtp.mockResolvedValue({ error: { message: 'expired' } });
  expect(target(await confirm(req('/auth/confirm?token_hash=th1&type=email')))).toBe('http://localhost:3000/connexion?erreur=lien');
  expect(rpc).not.toHaveBeenCalled();
});

test('confirm : type inconnu refusé', async () => {
  expect(target(await confirm(req('/auth/confirm?token_hash=th1&type=n_importe')))).toBe('http://localhost:3000/connexion?erreur=lien');
  expect(verifyOtp).not.toHaveBeenCalled();
});
