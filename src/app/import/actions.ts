'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { parseAiResponse } from '@/lib/ai/parse';
import { scriptSchema } from '@/lib/ai/schemas';
import { toImportPayload, type ImportPayload } from '@/lib/episodes/importPayload';
import { loadAccountContext } from '@/lib/episodes/load';
import { requireUser } from '@/lib/supabase/server';

const looseBatch = z.object({ episodes: z.array(z.unknown()).min(1).max(9) });

// Importe un lot d'épisodes écrits par Claude. Tout ou rien : un seul épisode invalide bloque le lot.
export async function importBatch(accountId: string, raw: string): Promise<{ ok: true; created: number } | { ok: false; error: string }> {
  const { supabase } = await requireUser();
  const parsed = parseAiResponse(raw, looseBatch);
  if (!parsed.ok) return parsed;

  const ctx = await loadAccountContext(supabase, accountId);
  if (!ctx) return { ok: false, error: 'Compte introuvable.' };

  const payloads: ImportPayload[] = [];
  for (const [i, item] of parsed.data.episodes.entries()) {
    const one = scriptSchema.safeParse(item);
    if (!one.success) {
      const issue = one.error.issues[0];
      return { ok: false, error: `Épisode ${i + 1} du lot : ${issue.path.join('.') || 'épisode'} ${issue.message}.` };
    }
    const prepared = toImportPayload(one.data, ctx);
    if (!prepared.ok) return { ok: false, error: `Épisode ${i + 1} du lot : ${prepared.error}` };
    payloads.push(prepared.payload);
  }

  const { data, error } = await supabase.rpc('import_batch', { p_account_id: accountId, p_payload: { episodes: payloads } });
  if (error) return { ok: false, error: "Le lot n'a pas pu être enregistré. Réessaie." };
  revalidatePath('/');
  return { ok: true, created: data ?? payloads.length };
}
