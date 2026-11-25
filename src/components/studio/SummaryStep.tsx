'use client';
import Link from 'next/link';
import { useState } from 'react';
import { updateSummary } from '@/app/episodes/[id]/actions';
import { CopyPasteStep } from './CopyPasteStep';

export function SummaryStep({ episodeId, accountId, prompt }: { episodeId: string; accountId: string; prompt: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-5">
        <p className="font-semibold text-[#2DD4BF]">Épisode validé ✓</p>
        <Link href={`/publier/${episodeId}`} className="inline-flex min-h-11 items-center rounded-full bg-violet px-5 font-semibold text-ink no-underline">
          Publier depuis le téléphone
        </Link>
      </div>
      {done ? (
        <p role="status" className="rounded-card border border-line bg-surface p-5 text-sm">
          Résumé du feuilleton mis à jour. Les prochaines idées tiendront compte de cet épisode.
        </p>
      ) : (
        <CopyPasteStep
          title="Mettre à jour le résumé du feuilleton"
          intro="Copie le texte et colle-le dans Claude : il met à jour le résumé pour que les prochains épisodes restent cohérents."
          prompt={prompt}
          onSubmit={async (raw) => {
            const r = await updateSummary(accountId, raw);
            if (r.ok) setDone(true);
            return r;
          }}
        />
      )}
    </div>
  );
}
