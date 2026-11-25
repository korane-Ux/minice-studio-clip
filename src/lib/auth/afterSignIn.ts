import type { Supabase } from '@/lib/supabase/server';

// Après l'ouverture de session : crée les 3 comptes au premier passage.
// Si la création échoue, /comptes réessaie et affiche un message clair.
export async function afterSignIn(supabase: Supabase, origin: string): Promise<string> {
  const { error } = await supabase.rpc('seed_default_accounts');
  return error ? `${origin}/comptes` : `${origin}/`;
}
