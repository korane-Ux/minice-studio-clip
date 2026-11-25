'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/supabase/env';

export type ActionResult = { ok: true } | { ok: false; error: string };

const emailSchema = z.string().trim().email();

export async function sendMagicLink(formData: FormData): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) return { ok: false, error: 'Adresse email invalide.' };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback` },
  });
  if (error) return { ok: false, error: "Le lien n'a pas pu être envoyé. Réessaie dans une minute." };
  return { ok: true };
}
