'use client';
import { useState } from 'react';

export function ModeToggle() {
  const [mode, setMode] = useState<'pas' | 'auto'>('pas');
  return (
    <div className="flex flex-col items-center gap-2">
      <div role="group" aria-label="Mode de création" className="flex gap-1 rounded-full border border-line bg-surface p-1">
        {[
          { v: 'pas' as const, label: 'Pas à pas' },
          { v: 'auto' as const, label: 'Pilote auto' },
        ].map((o) => (
          <button
            key={o.v}
            type="button"
            aria-pressed={mode === o.v}
            onClick={() => setMode(o.v)}
            className={`min-h-10 rounded-full px-5 text-sm font-semibold ${mode === o.v ? 'bg-line text-text' : 'text-muted'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {mode === 'auto' && (
        <p role="status" className="text-sm text-warning">
          Le pilote automatique démarre dès que tes clés API sont connectées.
        </p>
      )}
    </div>
  );
}
