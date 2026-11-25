'use client';
import { useState } from 'react';
import { MontageClipError, montageErrorMessage } from '@/lib/montage/errors';
import type { MontageRun } from '@/lib/montage/runner';
import { buildAss } from '@/lib/montage/subtitles';

async function defaultFetchClip(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Clip introuvable');
  return new Uint8Array(await res.arrayBuffer());
}

export type MontageScene = { id: string; position: number; startS: number; durationS: number; dialogue: string; clipUrl: string; clipPath: string };

export function MontageStep({
  lesson,
  scenes,
  run,
  onSave,
  fetchClip = defaultFetchClip,
}: {
  lesson: string;
  scenes: MontageScene[];
  run: MontageRun;
  onSave: (video: Blob) => Promise<{ ok: true } | { ok: false; error: string }>;
  fetchClip?: (url: string) => Promise<Uint8Array>;
}) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function launch() {
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const clips = await Promise.all(
        scenes.map(async (s) => {
          const ext = s.clipPath.split('.').pop() ?? 'mp4';
          const data = await fetchClip(s.clipUrl).catch(() => {
            throw new MontageClipError(s.position, 'download');
          });
          return { name: `scene${s.position}.${ext}`, data, durationS: s.durationS, position: s.position };
        }),
      );
      const video = await run(clips, buildAss(scenes, lesson), setProgress);
      const saved = await onSave(video);
      if (!saved.ok) setError(saved.error);
    } catch (e) {
      setError(montageErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="montage-titre" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <h2 id="montage-titre" className="text-lg font-semibold">
        Montage
      </h2>
      <p className="text-sm text-muted">
        Les {scenes.length} clips sont prêts. Le montage se fait dans ton navigateur : assemblage, format vertical, sous-titres et leçon finale. Compte une à
        deux minutes, de préférence sur ordinateur.
      </p>
      {busy && (
        <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Avancement du montage" className="h-2 rounded-full bg-line">
          <div className="h-2 rounded-full bg-violet transition-all" style={{ width: `${Math.max(4, progress * 100)}%` }} />
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button type="button" onClick={launch} disabled={busy} className="min-h-12 self-start rounded-full bg-violet px-6 font-semibold text-ink disabled:opacity-60">
        {busy ? 'Montage en cours…' : 'Lancer le montage'}
      </button>
    </section>
  );
}
