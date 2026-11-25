'use client';
import { useState, type KeyboardEvent } from 'react';

const TONES = {
  accent: 'bg-violet-tint text-text',
  neutral: 'bg-line-2 text-text',
  danger: 'bg-[#3B1424] text-[#FBCFE0]',
} as const;

export function ChipsField({
  name,
  label,
  values,
  max,
  tone,
  inputLabel = 'Nouvelle valeur',
}: {
  name: string;
  label: string;
  values: string[];
  max: number;
  tone: keyof typeof TONES;
  inputLabel?: string;
}) {
  const [items, setItems] = useState(values);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  function commit() {
    const v = draft.trim();
    if (v && !items.some((i) => i.toLowerCase() === v.toLowerCase()) && items.length < max) setItems([...items, v]);
    setDraft('');
    setAdding(false);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      setDraft('');
      setAdding(false);
    }
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {items.map((v) => (
          <span key={v} className={`inline-flex items-center gap-1 rounded-full py-1 pl-3 pr-1 text-sm ${TONES[tone]}`}>
            {v}
            <button
              type="button"
              aria-label={`Retirer ${v}`}
              onClick={() => setItems(items.filter((i) => i !== v))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-text"
            >
              ×
            </button>
            <input type="hidden" name={name} value={v} />
          </span>
        ))}
        {adding ? (
          <input
            autoFocus
            aria-label={inputLabel}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            onBlur={commit}
            maxLength={40}
            className="min-h-9 rounded-full border border-line bg-surface-2 px-3 text-sm text-text"
          />
        ) : (
          items.length < max && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="min-h-9 rounded-full border border-dashed border-line px-3 text-sm text-text hover:border-violet"
            >
              + Ajouter
            </button>
          )
        )}
      </div>
    </fieldset>
  );
}
