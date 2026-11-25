'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { rejectEpisode } from '@/app/episodes/[id]/actions';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

// Pour un épisode qui ne mène nulle part avant la validation (idée, scènes, montage).
export function AbandonEpisode({ episodeId }: { episodeId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-col items-start gap-2">
      <ConfirmButton
        label="Abandonner l'épisode"
        confirmLabel="Oui, abandonner"
        question="L'épisode passera en rejeté et ses clips seront supprimés."
        disabled={pending}
        onConfirm={() =>
          start(async () => {
            setError(null);
            const r = await rejectEpisode(episodeId);
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
    </div>
  );
}
