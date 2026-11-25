'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/supabase/env';

export type ActionResult = { ok: true } | { ok: false; error: string };

const emailSchema = z.string().trim().toLowerCase().email();

// Accès réservé : seules les adresses listées dans ALLOWED_EMAILS (séparées par des virgules) reçoivent un lien.
function isAllowed(email: string): boolean {
  const list = (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email);
}

export async function sendMagicLink(formData: FormData): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) return { ok: false, error: 'Adresse email invalide.' };
  if (!isAllowed(parsed.data)) return { ok: false, error: "Cette adresse n'a pas accès à Minice Studio Clip." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback`, shouldCreateUser: true },
  });
  if (error) return { ok: false, error: "Le lien n'a pas pu être envoyé. Réessaie dans une minute." };
  return { ok: true };
}

// Connexion par mot de passe (le mot de passe se choisit dans Supabase). Pas d'email envoyé, donc pas de limite d'envoi.
export async function signInWithPassword(formData: FormData): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) return { ok: false, error: 'Adresse email invalide.' };
  if (!isAllowed(parsed.data)) return { ok: false, error: "Cette adresse n'a pas accès à Minice Studio Clip." };
  const password = String(formData.get('password') ?? '');
  if (!password) return { ok: false, error: 'Entre ton mot de passe.' };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data, password });
  if (error) return { ok: false, error: 'Email ou mot de passe incorrect.' };

  // Premier passage : crée les 3 comptes (sans effet s'ils existent déjà).
  await supabase.rpc('seed_default_accounts');
  redirect('/');
}
