import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Retour du lien envoyé par email : ouvre la session, crée les 3 comptes au premier passage.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect(`${origin}/connexion?erreur=lien`);

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/connexion?erreur=lien`);

  await supabase.rpc('seed_default_accounts');
  return NextResponse.redirect(`${origin}/`);
}
