'use server';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/supabase/server';
import { accountFromForm, accountUpdateSchema, characterSchema } from '@/lib/validation/account';
import { isOwnPath } from '@/lib/video/clipFile';

export type FormResult = { ok: true; message?: string } | { ok: false; error: string };

function firstIssue(e: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const i = e.issues[0];
  return `Vérifie le champ « ${String(i.path[0] ?? '')} » : ${i.message}.`;
}

export async function updateAccount(id: string, fd: FormData): Promise<FormResult> {
  const { supabase } = await requireUser();
  const parsed = accountUpdateSchema.safeParse(accountFromForm(fd));
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const a = parsed.data;
  const { error } = await supabase
    .from('accounts')
    .update({
      name: a.name,
      color: a.color,
      style: a.style,
      content_focus: a.contentFocus,
      tone: a.tone,
      target_duration_s: a.targetDurationS,
      lesson_format: a.lessonFormat,
      core_values: a.coreValues,
      themes: a.themes,
      exclusions: a.exclusions,
      autopilot_cadence: a.autopilotCadence,
      autopilot_confirm: a.autopilotConfirm,
      auto_check: a.autoCheck,
    })
    .eq('id', id);
  if (error) return { ok: false, error: "L'enregistrement a échoué. Réessaie." };
  revalidatePath(`/comptes/${id}`);
  return { ok: true, message: 'Bible enregistrée.' };
}

export async function upsertCharacter(accountId: string, fd: FormData): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { supabase } = await requireUser();
  const parsed = characterSchema.safeParse({ name: fd.get('name'), description: fd.get('description') ?? '', color: fd.get('color') });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const existingId = String(fd.get('id') ?? '') || null;
  let characterId: string;
  if (existingId) {
    const { error } = await supabase.from('characters').update(parsed.data).eq('id', existingId);
    if (error) return { ok: false, error: "L'enregistrement a échoué. Réessaie." };
    characterId = existingId;
  } else {
    const { count } = await supabase.from('characters').select('id', { count: 'exact', head: true }).eq('account_id', accountId);
    const { data, error } = await supabase
      .from('characters')
      .insert({ ...parsed.data, account_id: accountId, position: (count ?? 0) + 1 })
      .select('id')
      .single();
    if (error || !data) return { ok: false, error: "L'ajout a échoué. Réessaie." };
    characterId = data.id;
  }
  revalidatePath(`/comptes/${accountId}`);
  return { ok: true, id: characterId };
}

// Appelé après l'envoi direct de l'image vers le bucket refs (voir src/lib/storage/upload.ts).
export async function setCharacterImage(characterId: string, path: string, accountId: string): Promise<FormResult> {
  const { supabase, user } = await requireUser();
  if (!isOwnPath(path, `${user.id}/${characterId}.`)) return { ok: false, error: 'Chemin d’image invalide.' };
  const { error } = await supabase.from('characters').update({ ref_image_path: path }).eq('id', characterId);
  if (error) return { ok: false, error: "L'image n'a pas pu être enregistrée." };
  revalidatePath(`/comptes/${accountId}`);
  return { ok: true };
}

export async function deleteCharacter(id: string, accountId: string): Promise<FormResult> {
  const { supabase } = await requireUser();
  const { data } = await supabase.from('characters').select('ref_image_path').eq('id', id).single();
  const { error } = await supabase.from('characters').delete().eq('id', id);
  if (error) return { ok: false, error: 'La suppression a échoué.' };
  if (data?.ref_image_path) await supabase.storage.from('refs').remove([data.ref_image_path]);
  revalidatePath(`/comptes/${accountId}`);
  return { ok: true };
}
