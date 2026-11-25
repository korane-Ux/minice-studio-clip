import { NextResponse, type NextRequest } from 'next/server';
import { afterSignIn } from '@/lib/auth/afterSignIn';
import { createServerSupabase } from '@/lib/supabase/server';

// Retour du lien par code (même navigateur que la demande). Le lien par défaut passe par /auth/confirm.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect(`${origin}/connexion?erreur=lien`);

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/connexion?erreur=lien`);

  return NextResponse.redirect(await afterSignIn(supabase, origin));
}
