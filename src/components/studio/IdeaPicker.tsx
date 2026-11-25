'use client';
import type { Idea } from '@/lib/ai/schemas';

export function IdeaPicker({ ideas, onPick, disabled }: { ideas: Idea[]; onPick: (idea: Idea) => void; disabled?: boolean }) {
  return (
    <section aria-labelledby="idees-titre" className="flex flex-col gap-3">
      <h2 id="idees-titre" className="text-lg font-semibold">
        Choisis une idée
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {ideas.map((idea) => (
          <button
            key={idea.title}
            type="button"
            disabled={disabled}
            onClick={() => onPick(idea)}
            className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 text-left hover:border-violet disabled:opacity-50"
          >
            <span className="font-semibold">{idea.title}</span>
            <span className="text-sm text-muted">{idea.pitch}</span>
            <span className="text-sm text-violet">Leçon : {idea.lesson}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
