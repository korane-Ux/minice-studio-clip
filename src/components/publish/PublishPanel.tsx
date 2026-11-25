'use client';
import { useState, useTransition } from 'react';
import type { EpisodeStatus } from '@/lib/domain/status';
import { shareText } from '@/lib/validation/views';

type Result = { ok: true } | { ok: false; error: string };

export function PublishPanel({
  episode,
  accountName,
  videoUrl,
  onPublish,
  onViews,
}: {
  episode: { id: string; title: string; number: number; caption: string; hashtags: string[]; status: EpisodeStatus; views: number | null };
  accountName: string;
  videoUrl: string | null;
  onPublish: () => Promise<Result>;
  onViews: (input: string) => Promise<Result>;
}) {
  const [labelOk, setLabelOk] = useState(false);
  const [published, setPublished] = useState(episode.status === 'publie');
  const [justPublished, setJustPublished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState(episode.views !== null ? String(episode.views) : '');
  const [viewsSaved, setViewsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const text = shareText(episode.caption, episode.hashtags);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <div>
        <p className="text-xs font-bold text-muted">
          {accountName} · Épisode {episode.number}
        </p>
        <h1 className="text-2xl font-bold">{episode.title}</h1>
      </div>
      {videoUrl ? (
        <video src={videoUrl} controls playsInline className="aspect-[9/16] max-h-[60vh] w-full rounded-card bg-black object-contain" />
      ) : (
        <div className="flex h-52 items-center justify-center rounded-card bg-surface-2 text-sm text-muted">Vidéo indisponible</div>
      )}
      {videoUrl && (
        <a href={videoUrl} className="flex min-h-12 items-center justify-center rounded-full bg-violet font-semibold text-ink no-underline">
          ↓ Télécharger la vidéo
        </a>
      )}
      <section aria-labelledby="legende-titre" className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="legende-titre" className="font-semibold">
            Légende et hashtags
          </h2>
          <button type="button" onClick={copy} className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold">
            {copied ? 'Copié ✓' : 'Copier'}
          </button>
        </div>
        <p className="whitespace-pre-line text-sm">{text}</p>
      </section>

      {!published && (
        <>
          <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-card border px-4 text-sm ${labelOk ? 'border-[#2DD4BF] bg-[#0F2E2C]' : 'border-line bg-surface'}`}>
            <input type="checkbox" checked={labelOk} onChange={(e) => setLabelOk(e.target.checked)} className="h-5 w-5 accent-[#2DD4BF]" />
            J&apos;ai activé le label « Contenu généré par IA »
          </label>
          <button
            type="button"
            disabled={!labelOk || pending}
            onClick={() =>
              start(async () => {
                setError(null);
                const r = await onPublish();
                if (r.ok) {
                  setPublished(true);
                  setJustPublished(true);
                } else setError(r.error);
              })
            }
            className="min-h-12 rounded-full bg-text font-semibold text-ink disabled:bg-line disabled:text-muted"
          >
            Marquer comme publié
          </button>
        </>
      )}

      {justPublished && (
        <p role="status" className="rounded-card bg-[#0F3A35] p-4 text-sm text-[#CCFBF1]">
          <strong>Publié.</strong> Reviens dans 24 h pour noter les vues de cet épisode.
        </p>
      )}

      {published && (
        <form
          id="vues"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              setError(null);
              setViewsSaved(false);
              const r = await onViews(views);
              if (r.ok) setViewsSaved(true);
              else setError(r.error);
            });
          }}
          className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4"
        >
          <label htmlFor="nb-vues" className="text-sm font-semibold text-muted">
            Nombre de vues
          </label>
          <div className="flex gap-2">
            <input
              id="nb-vues"
              inputMode="numeric"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              className="min-h-11 flex-1 rounded-ctrl border border-line bg-surface-2 px-3 text-text"
            />
            <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-violet px-4 text-sm font-semibold text-ink">
              Enregistrer les vues
            </button>
          </div>
          {viewsSaved && <p className="text-sm text-success">Vues enregistrées.</p>}
        </form>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
