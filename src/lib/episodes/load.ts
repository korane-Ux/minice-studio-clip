import 'server-only';
import type { BibleContext } from '@/lib/ai/schemas';
import { toAccount, toCharacter, toEpisode, toScene, type Account, type Character, type Episode, type Scene } from '@/lib/domain/types';
import type { Supabase } from '@/lib/supabase/server';

export type EpisodeBundle = { episode: Episode; account: Account; characters: Character[]; scenes: Scene[]; ctx: BibleContext };

// Charge un épisode avec son compte, ses personnages et ses scènes. null si introuvable (ou appartient à un autre utilisateur).
export async function loadEpisode(supabase: Supabase, episodeId: string): Promise<EpisodeBundle | null> {
  const { data: e } = await supabase.from('episodes').select('*').eq('id', episodeId).maybeSingle();
  if (!e) return null;
  const [{ data: a }, { data: chars }, { data: scenes }] = await Promise.all([
    supabase.from('accounts').select('*').eq('id', e.account_id).single(),
    supabase.from('characters').select('*').eq('account_id', e.account_id).order('position'),
    supabase.from('scenes').select('*').eq('episode_id', episodeId).order('position'),
  ]);
  if (!a) return null;
  const account = toAccount(a);
  const characters = (chars ?? []).map(toCharacter);
  return {
    episode: toEpisode(e),
    account,
    characters,
    scenes: (scenes ?? []).map(toScene),
    ctx: { account, characters, summary: account.seriesSummary },
  };
}

// Compte + personnages, pour préparer les prompts et les imports d'un compte. null si introuvable.
export async function loadAccountContext(supabase: Supabase, accountId: string): Promise<BibleContext | null> {
  const [{ data: a }, { data: chars }] = await Promise.all([
    supabase.from('accounts').select('*').eq('id', accountId).maybeSingle(),
    supabase.from('characters').select('*').eq('account_id', accountId).order('position'),
  ]);
  if (!a) return null;
  const account = toAccount(a);
  return { account, characters: (chars ?? []).map(toCharacter), summary: account.seriesSummary };
}
