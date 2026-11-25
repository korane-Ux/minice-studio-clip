import type { BibleContext, ScriptDraft } from '@/lib/ai/schemas';
import { buildScenePrompt } from '@/lib/video/scenePrompt';

export type ImportScene = {
  position: number;
  start_s: number;
  duration_s: number;
  visual: string;
  dialogue: string;
  character_ids: string[];
  prompt: string;
};

export type ImportPayload = { title: string; lesson: string; caption: string; hashtags: string[]; scenes: ImportScene[] };

// Prépare le payload de la fonction SQL import_script : débuts des scènes, personnages, prompts vidéo.
export function toImportPayload(draft: ScriptDraft, ctx: BibleContext): { ok: true; payload: ImportPayload } | { ok: false; error: string } {
  const byName = new Map(ctx.characters.map((c) => [c.name.trim().toLowerCase(), c]));
  for (const scene of draft.scenes) {
    for (const name of scene.characters) {
      if (!byName.has(name.trim().toLowerCase())) {
        return { ok: false, error: `Personnage inconnu : ${name}. Ajoute-le dans la bible ou corrige la réponse.` };
      }
    }
  }

  let start = 0;
  const scenes = draft.scenes.map((scene, i) => {
    const { prompt, refs } = buildScenePrompt({ account: ctx.account, scene, position: i + 1, cast: ctx.characters });
    const s: ImportScene = {
      position: i + 1,
      start_s: start,
      duration_s: scene.durationS,
      visual: scene.visual,
      dialogue: scene.dialogue,
      character_ids: refs.map((c) => c.id),
      prompt,
    };
    start += scene.durationS;
    return s;
  });

  return { ok: true, payload: { title: draft.title, lesson: draft.lesson, caption: draft.caption, hashtags: draft.hashtags, scenes } };
}
