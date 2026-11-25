'use client';
import { useState } from 'react';

// Action destructive en deux temps : un premier clic affiche la question, le second confirme.
export function ConfirmButton({
  label,
  confirmLabel,
  question,
  onConfirm,
  disabled,
  className = 'min-h-11 rounded-full px-4 text-sm text-danger',
}: {
  label: string;
  confirmLabel: string;
  question: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button type="button" disabled={disabled} onClick={() => setAsking(true)} className={`${className} disabled:opacity-60`}>
        {label}
      </button>
    );
  }
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2 rounded-ctrl border border-danger/40 bg-danger/10 p-2">
      <p className="text-sm">{question}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className="min-h-11 rounded-full bg-danger px-4 text-sm font-semibold text-text disabled:opacity-60"
      >
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className="min-h-11 rounded-full px-4 text-sm text-muted">
        Annuler
      </button>
    </div>
  );
}
