'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { startEpisode } from '@/app/actions/startEpisode';
import type { Account } from '@/lib/domain/types';
import { ModeToggle } from './ModeToggle';

const SHORTCUTS = [
  { label: '5 idées', hint: '' },
  { label: 'Fable', hint: 'Une fable moderne avec une leçon de vie' },
  { label: 'Parabole', hint: 'Une parabole de Jésus mise en scène' },
  { label: 'Saga familiale', hint: 'Une saga familiale où l’humilité est récompensée' },
];

export function HeroPrompt({ firstName, accounts }: { firstName: string; accounts: Account[] }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [hint, setHint] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const color = accounts.find((a) => a.id === accountId)?.color;

  function launch(withHint: string) {
    if (!accountId) return;
    setError(null);
    start(async () => {
      const r = await startEpisode({ accountId, hint: withHint });
      if (r && !r.ok) setError(r.error);
    });
  }

  return (
    <section aria-labelledby="hero-titre" className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 pb-10 pt-14 text-center">
      <h1 id="hero-titre" className="text-3xl font-bold leading-tight md:text-4xl">
        Bonjour {firstName} ! Quelle histoire on raconte aujourd&apos;hui ?
      </h1>
      <ModeToggle />
      <div className="w-full rounded-[22px] border border-line bg-surface p-3 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <p className="mb-2 rounded-ctrl bg-violet-tint px-3 py-2 text-sm text-muted">
          <strong className="text-violet">Astuce</strong> · décris une idée, ou laisse vide pour recevoir 5 propositions
        </p>
        <label htmlFor="idee" className="sr-only">
          Ton idée d&apos;histoire
        </label>
        <textarea
          id="idee"
          rows={3}
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          maxLength={500}
          placeholder="Décris une idée d’histoire, ou laisse Minice t’en proposer 5..."
          className="w-full resize-none bg-transparent px-2 py-2 text-base text-text outline-none placeholder:text-muted"
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-line px-3 text-sm font-semibold">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            <span className="sr-only">Compte</span>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="min-h-10 bg-transparent text-text outline-none">
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-surface">
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <span className="flex-1" />
          <button
            type="button"
            aria-label="Lancer"
            disabled={pending || !accountId}
            onClick={() => launch(hint)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-violet text-ink disabled:opacity-60"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
            </svg>
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <p className="text-sm font-semibold text-muted">Ce que Minice Studio Clip peut faire</p>
      <div className="flex flex-wrap justify-center gap-2">
        {SHORTCUTS.map((s) => (
          <button
            key={s.label}
            type="button"
            disabled={pending}
            onClick={() => (s.hint ? setHint(s.hint) : launch(''))}
            className="min-h-11 rounded-ctrl border border-line bg-surface px-4 text-sm font-semibold hover:border-violet"
          >
            {s.label}
          </button>
        ))}
        <Link href="/import" className="inline-flex min-h-11 items-center rounded-ctrl border border-line bg-surface px-4 text-sm font-semibold no-underline hover:border-violet">
          Importer un lot
        </Link>
      </div>
    </section>
  );
}
