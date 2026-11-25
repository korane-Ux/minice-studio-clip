export function supabaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error('NEXT_PUBLIC_SUPABASE_URL manquant (voir .env.example)');
  return v;
}

export function supabaseKey(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!v) throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY manquant (voir .env.example)');
  return v;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}
