'use client';
import { useId, useState, useTransition } from 'react';

export function CopyPasteStep({
  title,
  prompt,
  onSubmit,
  intro,
}: {
  title: string;
  prompt: string;
  onSubmit: (raw: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  intro?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const id = useId();

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function submit() {
    setError(null);
    start(async () => {
      const r = await onSubmit(raw);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <section aria-labelledby={`${id}-t`} className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <h2 id={`${id}-t`} className="text-lg font-semibold">
        {title}
      </h2>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-muted">
        <li>{intro ?? 'Copie le texte et colle-le dans une conversation avec Claude.'}</li>
        <li>Copie toute la réponse de Claude et colle-la ci-dessous.</li>
      </ol>
      <details className="rounded-ctrl border border-line bg-surface-2 p-3 text-sm">
        <summary className="cursor-pointer font-semibold">Voir le texte pour Claude</summary>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">{prompt}</pre>
      </details>
      <button type="button" onClick={copy} className="min-h-11 self-start rounded-full bg-violet px-5 font-semibold text-ink">
        {copied ? 'Texte copié ✓' : 'Copier le texte pour Claude'}
      </button>
      <label htmlFor={`${id}-r`} className="text-sm font-semibold text-muted">
        Colle ici la réponse de Claude
      </label>
      <textarea
        id={`${id}-r`}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={8}
        className="rounded-ctrl border border-line bg-surface-2 p-3 font-mono text-xs text-text"
      />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={pending || !raw.trim()}
        className="min-h-11 self-start rounded-full border border-line px-5 font-semibold disabled:opacity-50"
      >
        {pending ? 'Lecture…' : 'Lire la réponse'}
      </button>
    </section>
  );
}
