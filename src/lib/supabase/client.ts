'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/db/types';
import { supabaseKey, supabaseUrl } from './env';

export function createBrowserSupabase() {
  return createBrowserClient<Database>(supabaseUrl(), supabaseKey());
}
