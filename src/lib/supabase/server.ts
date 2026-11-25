import 'server-only';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Database } from '@/lib/db/types';
import { supabaseKey, supabaseUrl } from './env';

export type Supabase = SupabaseClient<Database>;

export async function createServerSupabase(): Promise<Supabase> {
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl(), supabaseKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Appelé depuis un Server Component : le proxy rafraîchit déjà la session.
        }
      },
    },
  });
}

export async function requireUser(): Promise<{ supabase: Supabase; user: User }> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/connexion');
  return { supabase, user: data.user };
}
