'use server';
import { redirect } from 'next/navigation';
import { nextEpisodeNumber } from '@/lib/domain/episodes';
import { requireUser } from '@/lib/supabase/server';

export async function startEpisode(input: { accountId: string; hint?: string }): Promise<{ ok: false; error: string }> {
  const { supabase } = await requireUser();
  const hint = input.hint?.trim().slice(0, 500) || undefined;

  let created: string | null = null;
  for (let attempt = 0; attempt < 2 && !created; attempt++) {
    const { data: rows } = await supabase.from('episodes').select('number').eq('account_id', input.accountId);
    const number = nextEpisodeNumber((rows ?? []).map((r) => r.number));
    const { data, error } = await supabase
      .from('episodes')
      .insert({ account_id: input.accountId, number, idea: hint ? { hint } : {} })
      .select('id')
      .single();
    if (data) created = data.id;
    else if (error?.code !== '23505') break; // 23505 : numéro déjà pris en même temps, on réessaie
  }
  if (!created) return { ok: false, error: "L'épisode n'a pas pu être créé. Réessaie." };
  redirect(`/episodes/${created}`);
}
