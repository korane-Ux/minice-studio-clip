import { notFound } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { AbandonEpisode } from '@/components/studio/AbandonEpisode';
import { IdeaStep, ScriptStep } from '@/components/studio/IdeaScriptSteps';
import { ScenesStep } from '@/components/studio/ScenesStep';
import { SummaryStep } from '@/components/studio/SummaryStep';
import { MontageContainer, ValidationStep } from '@/components/studio/ValidationStep';
import { currentStep, Stepper } from '@/components/studio/Stepper';
import { ideaSchema } from '@/lib/ai/schemas';
import { ideasStep, scriptStep, summaryStep } from '@/lib/ai/steps';
import { loadEpisode } from '@/lib/episodes/load';
import { requireUser } from '@/lib/supabase/server';

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const bundle = await loadEpisode(supabase, id);
  if (!bundle) notFound();
  const { episode, account, ctx, scenes, characters } = bundle;

  const refPaths = characters.map((c) => c.refImagePath).filter((p): p is string => !!p);
  const refUrls: Record<string, string> = {};
  if (refPaths.length) {
    const { data } = await supabase.storage.from('refs').createSignedUrls(refPaths, 3600);
    for (const s of data ?? []) if (s.path && s.signedUrl) refUrls[s.path] = s.signedUrl;
  }

  const clipUrls: Record<string, string> = {};
  const clipPaths = scenes.map((s) => s.clipPath).filter((p): p is string => !!p);
  if (episode.status === 'montage' && clipPaths.length) {
    const { data } = await supabase.storage.from('clips').createSignedUrls(clipPaths, 3600);
    for (const s of data ?? []) if (s.path && s.signedUrl) clipUrls[s.path] = s.signedUrl;
  }
  let videoUrl: string | null = null;
  if (episode.status === 'a_valider' && episode.videoPath) {
    const { data } = await supabase.storage.from('videos').createSignedUrl(episode.videoPath, 3600);
    videoUrl = data?.signedUrl ?? null;
  }
  const names = new Map(characters.map((c) => [c.id, c.name]));
  const script = {
    title: episode.title,
    lesson: episode.lesson,
    caption: episode.caption,
    hashtags: episode.hashtags,
    scenes: scenes.map((s) => ({ visual: s.visual, dialogue: s.dialogue, durationS: s.durationS, characters: s.characterIds.map((id) => names.get(id) ?? '') })),
  };

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
        {step === 2 && (
          <ScenesStep episodeId={episode.id} userId={user.id} scenes={scenes} characters={characters} refUrls={refUrls} lesson={episode.lesson} />
        )}
        {step === 3 && (
          <>
            <MontageContainer
              episodeId={episode.id}
              userId={user.id}
              lesson={episode.lesson}
              scenes={scenes.map((s) => ({ id: s.id, position: s.position, startS: s.startS, durationS: s.durationS, dialogue: s.dialogue, clipPath: s.clipPath ?? '', clipUrl: s.clipPath ? (clipUrls[s.clipPath] ?? '') : '' }))}
            />
            {/* Un clip refusé par le montage se remplace ici, sans revenir en arrière. */}
            <ScenesStep episodeId={episode.id} userId={user.id} scenes={scenes} characters={characters} refUrls={refUrls} lesson={episode.lesson} />
          </>
        )}
        {step === 4 && <ValidationStep episodeId={episode.id} videoUrl={videoUrl} scenes={scenes.map((s) => ({ id: s.id, position: s.position }))} />}
        {(episode.status === 'valide' || episode.status === 'publie') && (
          <SummaryStep episodeId={episode.id} accountId={account.id} prompt={summaryStep.buildPrompt({ ctx, script })} />
        )}
        {(episode.status === 'idee' || episode.status === 'scenes' || episode.status === 'montage') && (
          <footer className="border-t border-line pt-4">
            <AbandonEpisode episodeId={episode.id} />
          </footer>
        )}
        {episode.status === 'rejete' && (
          <p className="rounded-card border border-line bg-surface p-5 text-muted">Cet épisode a été rejeté. Lance une nouvelle idée depuis l&apos;accueil.</p>
        )}
      </main>
    </AppShell>
  );
}
