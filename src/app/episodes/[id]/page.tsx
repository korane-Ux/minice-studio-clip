import { notFound } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { IdeaStep, ScriptStep } from '@/components/studio/IdeaScriptSteps';
import { currentStep, Stepper } from '@/components/studio/Stepper';
import { ideaSchema } from '@/lib/ai/schemas';
import { ideasStep, scriptStep } from '@/lib/ai/steps';
import { loadEpisode } from '@/lib/episodes/load';
import { requireUser } from '@/lib/supabase/server';

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const bundle = await loadEpisode(supabase, id);
  if (!bundle) notFound();
  const { episode, account, ctx } = bundle;

  const chosen = ideaSchema.safeParse(episode.idea);
  const step = currentStep(episode.status, chosen.success);

  return (
    <AppShell active="studio">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: account.color }}>
              {account.name} · Épisode {episode.number}
            </p>
            <h1 className="text-3xl font-bold">{episode.title || 'Nouvel épisode'}</h1>
          </div>
          <Stepper current={step} />
        </header>

        {step === 0 && <IdeaStep episodeId={episode.id} prompt={ideasStep.buildPrompt({ ctx, hint: episode.idea.hint })} />}
        {step === 1 && chosen.success && (
          <ScriptStep episodeId={episode.id} idea={chosen.data} prompt={scriptStep.buildPrompt({ ctx, idea: chosen.data })} />
        )}
      </main>
    </AppShell>
  );
}
