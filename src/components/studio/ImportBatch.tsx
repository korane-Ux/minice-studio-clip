'use client';
import Link from 'next/link';
import { useState } from 'react';
import { importBatch } from '@/app/import/actions';
import type { BibleContext } from '@/lib/ai/schemas';
import { batchStep } from '@/lib/ai/steps';
import { CopyPasteStep } from './CopyPasteStep';

export function ImportBatch({ contexts }: { contexts: BibleContext[] }) {
  const [accountId, setAccountId] = useState(contexts[0]?.account.id ?? '');
  const [count, setCount] = useState(3);
  const [created, setCreated] = useState<number | null>(null);
  const ctx = contexts.find((c) => c.account.id === accountId);
  if (!ctx) return null;

  if (created !== null) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
        <p className="font-semibold">{created} épisodes importés dans {ctx.account.name}.</p>
        <Link href={`/?vue=episodes&compte=${ctx.account.id}`} className="inline-flex min-h-11 items-center self-start rounded-full bg-violet px-5 font-semibold text-ink no-underline">
          Voir les épisodes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-muted">
          Compte
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="min-h-11 rounded-ctrl border border-line bg-surface-2 px-3 text-text">
            {contexts.map((c) => (
              <option key={c.account.id} value={c.account.id}>
                {c.account.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-muted">
          Nombre d&apos;épisodes
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="min-h-11 rounded-ctrl border border-line bg-surface-2 px-3 text-text">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <CopyPasteStep
        key={`${accountId}-${count}`}
        title={`Écrire ${count} épisodes d'un coup`}
        prompt={batchStep.buildPrompt({ ctx, count })}
        onSubmit={async (raw) => {
          const r = await importBatch(accountId, raw);
          if (r.ok) setCreated(r.created);
          return r.ok ? { ok: true } : r;
        }}
      />
    </div>
  );
}
