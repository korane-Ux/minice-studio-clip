import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { afterSignIn } from '@/lib/auth/afterSignIn';
import { createServerSupabase } from '@/lib/supabase/server';

const TYPES: EmailOtpType[] = ['email', 'magiclink', 'signup'];

// Lien de l'email : fonctionne même s'il est ouvert sur un autre appareil que celui de la demande.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  if (!tokenHash || !type || !TYPES.includes(type)) return NextResponse.redirect(`${origin}/connexion?erreur=lien`);

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(`${origin}/connexion?erreur=lien`);

  return NextResponse.redirect(await afterSignIn(supabase, origin));
}
