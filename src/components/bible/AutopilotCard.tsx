'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Account } from '@/lib/domain/types';

const CADENCES = [
  { value: 1, label: '1 épisode par semaine' },
  { value: 2, label: '2 épisodes par semaine' },
  { value: 3, label: '3 épisodes par semaine' },
  { value: 7, label: '1 épisode par jour' },
];

export function AutopilotCard({ account, hasApiKeys }: { account: Account; hasApiKeys: boolean }) {
  const [confirm, setConfirm] = useState(account.autopilotConfirm);
  const [check, setCheck] = useState(account.autoCheck);

  return (
    <section aria-labelledby="pilote-titre" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="pilote-titre" className="text-lg font-semibold">
          Pilote automatique
        </h2>
        {!hasApiKeys && <span className="rounded-full bg-warning px-3 py-1 text-xs font-bold text-ink">Clés requises</span>}
      </div>
      <p className="text-sm text-muted">
        Minice génère les épisodes tout seul avec ces réglages, dès que tes clés sont connectées dans{' '}
        <Link href="/cles-api" className="text-violet underline">
          Clés API
        </Link>
        .
      </p>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-muted">
        Rythme
        <select
          name="autopilotCadence"
          defaultValue={account.autopilotCadence}
          className="min-h-11 rounded-ctrl border border-line bg-surface-2 px-3 font-normal text-text"
        >
          {CADENCES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-muted">Avant publication</span>
        <div role="group" aria-label="Validation" className="flex gap-1 rounded-full border border-line bg-surface-2 p-1">
          {[
            { v: true, label: 'Toujours confirmer' },
            { v: false, label: 'Sans confirmation' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={confirm === o.v}
              onClick={() => setConfirm(o.v)}
              className={`min-h-10 flex-1 rounded-full text-sm font-semibold ${confirm === o.v ? 'bg-line text-text' : 'text-muted'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="autopilotConfirm" value={String(confirm)} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Contrôle automatique</p>
          <p className="text-xs text-muted">Une IA relit chaque épisode et le compare à ces règles.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={check}
          aria-label="Contrôle automatique"
          onClick={() => setCheck(!check)}
          className="flex min-h-11 min-w-14 items-center"
        >
          <span className={`flex h-7 w-12 items-center rounded-full p-0.5 ${check ? 'justify-end bg-violet' : 'justify-start bg-line'}`}>
            <span className="h-6 w-6 rounded-full bg-white" />
          </span>
        </button>
        <input type="hidden" name="autoCheck" value={String(check)} />
      </div>
    </section>
  );
}
