'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ChangeEvent } from 'react';
import { registerClip, removeClip } from '@/app/episodes/[id]/scene-actions';
import type { Character, Scene } from '@/lib/domain/types';
import { uploadToBucket } from '@/lib/storage/upload';
import { clipPath, validateClipFile } from '@/lib/video/clipFile';
import { VIDEO_TOOLS } from '@/lib/video/tools';

export function ScenesStep({
  episodeId,
  userId,
  scenes,
  characters,
  refUrls,
  lesson,
}: {
  episodeId: string;
  userId: string;
  scenes: Scene[];
  characters: Character[];
  refUrls: Record<string, string>;
  lesson: string;
}) {
  const firstMissing = scenes.find((s) => !s.clipPath) ?? scenes[0];
  const [selected, setSelected] = useState(firstMissing?.id);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const cur = scenes.find((s) => s.id === selected) ?? scenes[0];
  const done = scenes.filter((s) => s.clipPath).length;
  const byId = new Map(characters.map((c) => [c.id, c]));

  async function copy() {
    try {
      await navigator.clipboard.writeText(cur.prompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !cur) return;
    setError(null);
    const check = validateClipFile(file);
    if (!check.ok) return setError(check.error);
    start(async () => {
      const path = clipPath(userId, episodeId, cur.id, check.ext);
      const up = await uploadToBucket('clips', path, file);
      if (!up.ok) return setError(up.error);
      const r = await registerClip(cur.id, path);
      if (!r.ok) return setError(r.error);
      const next = scenes.find((s) => s.id !== cur.id && !s.clipPath);
      if (next) setSelected(next.id);
      setCopied(false);
      router.refresh();
    });
  }

  function remove() {
    if (!cur) return;
    start(async () => {
      const r = await removeClip(cur.id);
      if (!r.ok) setError(r.error);
      router.refresh();
    });
  }

  if (!cur) return null;
  return (
    <div className="flex flex-wrap items-start gap-5">
      <section aria-labelledby="scenes-titre" className="flex min-w-0 flex-[3_1_440px] flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="scenes-titre" className="text-lg font-semibold">
            Scènes
          </h2>
          <span className="text-sm font-semibold text-muted">
            {done} clips sur {scenes.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-line">
          <div className="h-1.5 rounded-full bg-[#2DD4BF]" style={{ width: `${Math.max(2, (done / scenes.length) * 100)}%` }} />
        </div>
        {scenes.map((s) => {
          const sel = s.id === cur.id;
          return (
            <article key={s.id} className={`flex gap-3 rounded-card border-2 p-3 ${sel ? 'border-violet bg-violet-tint/40' : 'border-line bg-surface'}`}>
              <div aria-hidden="true" className={`flex h-28 w-16 shrink-0 items-center justify-center rounded-ctrl text-xl font-bold ${s.clipPath ? 'bg-[#10302F]' : 'bg-line'}`}>
                {s.position}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <button type="button" onClick={() => setSelected(s.id)} aria-pressed={sel} className="flex flex-col gap-1 text-left">
                  <span className="text-xs font-semibold text-muted">
                    Scène {s.position} · {s.durationS} s
                  </span>
                  <span className="text-sm">{s.visual}</span>
                  {s.dialogue && <span className="text-sm italic text-muted">{s.dialogue}</span>}
                </button>
                <span className={`self-start rounded-full px-2.5 py-1 text-xs font-bold ${s.clipPath ? 'bg-[#2DD4BF] text-ink' : 'bg-warning text-ink'}`}>
                  {s.clipPath ? 'Clip déposé' : 'Clip à générer'}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <aside aria-labelledby="prompt-titre" className="flex min-w-0 flex-[2_1_320px] flex-col gap-4 rounded-card border border-line bg-surface p-5 md:sticky md:top-6">
        <div>
          <p className="text-xs font-semibold text-muted">
            Scène {cur.position} · {cur.durationS} s
          </p>
          <h2 id="prompt-titre" className="text-lg font-semibold">
            Prompt pour l&apos;outil vidéo
          </h2>
        </div>
        <p className="rounded-ctrl border border-line bg-surface-2 p-3 font-mono text-xs leading-relaxed">{cur.prompt}</p>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-muted">Images à joindre, dans cet ordre</span>
          <div className="flex flex-wrap gap-2">
            {cur.characterIds.map((id, i) => {
              const c = byId.get(id);
              if (!c) return null;
              const url = c.refImagePath ? refUrls[c.refImagePath] : undefined;
              return (
                <figure key={id} className="flex w-20 flex-col gap-1">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={c.name} className="h-20 w-20 rounded-ctrl object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-ctrl bg-[#8A8F9C] text-center text-[10px] text-ink">Pas d&apos;image</div>
                  )}
                  <figcaption className="text-xs text-muted">
                    {i + 1}. {c.name}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
        <button type="button" onClick={copy} className="min-h-11 rounded-full bg-violet font-semibold text-ink">
          {copied ? 'Prompt copié ✓' : 'Copier le prompt'}
        </button>
        <div className="flex flex-wrap gap-2 text-sm">
          {VIDEO_TOOLS.map((t) => (
            <a key={t.name} href={t.url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-line px-3 no-underline hover:border-violet">
              {t.name} ↗
            </a>
          ))}
        </div>
        <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-dashed border-muted px-4 text-sm font-semibold">
          {pending ? 'Envoi en cours…' : cur.clipPath ? 'Remplacer le clip' : '↥ Déposer le clip de cette scène'}
          <input type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" onChange={onFile} disabled={pending} className="sr-only" />
        </label>
        {cur.clipPath && (
          <button type="button" onClick={remove} disabled={pending} className="min-h-10 text-sm text-danger">
            Retirer ce clip
          </button>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <p className="border-t border-line pt-3 text-sm text-muted">
          Leçon finale : <strong className="text-text">« {lesson} »</strong>
        </p>
      </aside>
    </div>
  );
}
