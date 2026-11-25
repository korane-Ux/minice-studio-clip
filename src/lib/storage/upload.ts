'use client';
import { createBrowserSupabase } from '@/lib/supabase/client';

// Envoi direct du navigateur vers Supabase Storage (les fichiers ne passent pas par le serveur de l'appli,
// dont les requêtes sont limitées à quelques Mo). La RLS de storage.objects vérifie le dossier {user_id}/.
export async function uploadToBucket(bucket: 'refs' | 'clips' | 'videos', path: string, file: Blob, contentType?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: contentType ?? (file.type || undefined) });
  if (error) return { ok: false, error: "L'envoi du fichier a échoué. Vérifie ta connexion et réessaie." };
  return { ok: true };
}
