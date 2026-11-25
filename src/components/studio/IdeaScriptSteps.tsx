'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { chooseIdea, importScript } from '@/app/episodes/[id]/actions';
import { parseAiResponse } from '@/lib/ai/parse';
import { ideasSchema, type Idea } from '@/lib/ai/schemas';
import { CopyPasteStep } from './CopyPasteStep';
import { IdeaPicker } from './IdeaPicker';

export function IdeaStep({ episodeId, prompt }: { episodeId: string; prompt: string }) {
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (ideas) {
    return (
      <div className="flex flex-col gap-3">
        <IdeaPicker
          ideas={ideas}
          disabled={pending}
          onPick={(idea) =>
            start(async () => {
              const r = await chooseIdea(episodeId, idea);
              if (r.ok) router.refresh();
              else setError(r.error);
            })
          }
        />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <button type="button" onClick={() => setIdeas(null)} className="min-h-11 self-start text-sm text-muted underline">
          Redemander d&apos;autres idées
        </button>
      </div>
    );
  }

  return (
    <CopyPasteStep
      title="Étape 1 : 5 idées d'épisode"
      prompt={prompt}
      onSubmit={async (raw) => {
        const r = parseAiResponse(raw, ideasSchema);
        if (!r.ok) return r;
        setIdeas(r.data.ideas);
        return { ok: true };
      }}
    />
  );
}

export function ScriptStep({ episodeId, prompt, idea }: { episodeId: string; prompt: string; idea: Idea }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-line bg-surface-2 p-4 text-sm">
        <p className="font-semibold">{idea.title}</p>
        <p className="text-muted">{idea.pitch}</p>
        <p className="text-violet">Leçon : {idea.lesson}</p>
      </div>
      <CopyPasteStep
        title="Étape 2 : le script découpé en scènes"
        prompt={prompt}
        onSubmit={async (raw) => {
          const r = await importScript(episodeId, raw);
          if (r.ok) router.refresh();
          return r;
        }}
      />
    </div>
  );
}
