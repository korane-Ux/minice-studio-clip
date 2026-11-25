import type { z } from 'zod';
import { buildBatchPrompt } from './prompts/batch';
import { buildIdeasPrompt } from './prompts/ideas';
import { buildScriptPrompt } from './prompts/script';
import { buildSummaryPrompt } from './prompts/summary';
import { batchSchema, ideasSchema, scriptSchema, summarySchema, type BibleContext, type Idea, type ScriptDraft } from './schemas';

// Une étape IA = un prompt + le schéma de la réponse attendue.
// V1 (mode manuel) : l'appli affiche buildPrompt, Arthur colle la réponse, parseAiResponse la lit avec schema.
// V2 (pilote automatique) : un runner appellera l'API avec le même prompt et validera avec le même schéma.
export type AiStep<I, O> = {
  id: 'idees' | 'script' | 'resume' | 'lot';
  buildPrompt(input: I): string;
  schema: z.ZodType<O>;
};

export const ideasStep: AiStep<{ ctx: BibleContext; hint?: string }, { ideas: Idea[] }> = {
  id: 'idees',
  buildPrompt: ({ ctx, hint }) => buildIdeasPrompt(ctx, hint),
  schema: ideasSchema,
};

export const scriptStep: AiStep<{ ctx: BibleContext; idea: Idea }, ScriptDraft> = {
  id: 'script',
  buildPrompt: ({ ctx, idea }) => buildScriptPrompt(ctx, idea),
  schema: scriptSchema,
};

export const summaryStep: AiStep<{ ctx: BibleContext; script: ScriptDraft }, { summary: string }> = {
  id: 'resume',
  buildPrompt: ({ ctx, script }) => buildSummaryPrompt(ctx, script),
  schema: summarySchema,
};

export const batchStep: AiStep<{ ctx: BibleContext; count: number }, { episodes: ScriptDraft[] }> = {
  id: 'lot',
  buildPrompt: ({ ctx, count }) => buildBatchPrompt(ctx, count),
  schema: batchSchema,
};
