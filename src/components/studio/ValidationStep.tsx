'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { approveEpisode, redoScene, rejectEpisode, saveVideo } from '@/app/episodes/[id]/actions';
import { runMontage } from '@/lib/montage/runMontage';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { uploadToBucket } from '@/lib/storage/upload';
import { MontageStep, type MontageScene } from './MontageStep';

export function MontageContainer({ episodeId, userId, lesson, scenes }: { episodeId: string; userId: string; lesson: string; scenes: MontageScene[] }) {
  const router = useRouter();
  return (
    <MontageStep
      lesson={lesson}
      scenes={scenes}
      run={runMontage}
      onSave={async (video) => {
        const path = `${userId}/${episodeId}.mp4`;
        const up = await uploadToBucket('videos', path, video, 'video/mp4');
        if (!up.ok) return up;
        const r = await saveVideo(episodeId, path);
        if (r.ok) router.refresh();
        return r;
      }}
    />
  );
}

export function ValidationStep({ episodeId, videoUrl, scenes }: { episodeId: string; videoUrl: string | null; scenes: { id: string; position: number }[] }) {
  const [redo, setRedo] = useState(scenes[0]?.id ?? '');
  const redoPosition = scenes.find((s) => s.id === redo)?.position ?? '';
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function act(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
      else setError(r.error);
    });
  }

  return (
    <section aria-labelledby="valid-titre" className="flex flex-wrap items-start gap-6 rounded-card border border-line bg-surface p-6">
      {videoUrl ? (
        <video src={videoUrl} controls playsInline className="aspect-[9/16] w-full max-w-[300px] rounded-card bg-black" />
      ) : (
        <div className="flex aspect-[9/16] w-full max-w-[300px] items-center justify-center rounded-card bg-surface-2 text-sm text-muted">Vidéo indisponible</div>
      )}
      <div className="flex min-w-[260px] flex-1 flex-col gap-4">
        <h2 id="valid-titre" className="text-lg font-semibold">
          Validation
        </h2>
        <p className="text-sm text-muted">Regarde l&apos;épisode en entier. Vérifie les visages, les voix, les sous-titres et la leçon finale.</p>
        <button type="button" disabled={pending} onClick={() => act(() => approveEpisode(episodeId))} className="min-h-12 rounded-full bg-violet font-semibold text-ink disabled:opacity-60">
          Valider l&apos;épisode
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted">
            Refaire la scène
            <select value={redo} onChange={(e) => setRedo(e.target.value)} className="min-h-10 rounded-ctrl border border-line bg-surface-2 px-2 text-text">
              {scenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.position}
                </option>
              ))}
            </select>
          </label>
          <ConfirmButton
            label="Refaire cette scène"
            confirmLabel={`Oui, refaire la scène ${redoPosition}`}
            question="La vidéo montée sera supprimée et tu redéposeras un clip pour cette scène."
            disabled={pending || !redo}
            onConfirm={() => act(() => redoScene(episodeId, redo))}
            className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold"
          />
        </div>
        <ConfirmButton
          label="Rejeter l'épisode"
          confirmLabel="Oui, rejeter"
          question="Les clips et la vidéo de cet épisode seront supprimés."
          disabled={pending}
          onConfirm={() => act(() => rejectEpisode(episodeId))}
          className="min-h-11 self-start rounded-full px-4 text-sm text-danger"
        />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
