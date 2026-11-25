import { z } from 'zod';
import type { Account, Character } from '@/lib/domain/types';

z.config(z.locales.fr());

export type BibleContext = { account: Account; characters: Character[]; summary: string };

export const ideaSchema = z.object({
  title: z.string().min(1).max(80),
  pitch: z.string().min(1).max(400),
  lesson: z.string().min(1).max(160),
});
export type Idea = z.infer<typeof ideaSchema>;

export const ideasSchema = z.object({ ideas: z.array(ideaSchema).length(5) });

export const sceneDraftSchema = z.object({
  visual: z.string().min(1),
  dialogue: z.string(),
  durationS: z.number().min(2).max(8),
  characters: z.array(z.string()),
});
export type SceneDraft = z.infer<typeof sceneDraftSchema>;

export const scriptSchema = z
  .object({
    title: z.string().min(1).max(80),
    lesson: z.string().min(1).max(160),
    caption: z.string().min(1).max(300),
    hashtags: z.array(z.string().regex(/^#\S+$/, 'un hashtag commence par # et ne contient pas d’espace')).min(3).max(6),
    scenes: z.array(sceneDraftSchema).min(3).max(5),
  })
  .refine(
    (s) => {
      const total = s.scenes.reduce((sum, sc) => sum + sc.durationS, 0);
      return total >= 20 && total <= 40;
    },
    { message: 'la durée totale doit être entre 20 et 40 secondes', path: ['scenes'] },
  );
export type ScriptDraft = z.infer<typeof scriptSchema>;

export const summarySchema = z.object({ summary: z.string().min(1).max(1200) });

export const batchSchema = z.object({ episodes: z.array(scriptSchema).min(1).max(9) });
