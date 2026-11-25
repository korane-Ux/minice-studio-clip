const ERROR = 'Indique un nombre de vues (chiffres uniquement).';

// Accepte « 12 500 », « 12 500 » (espace fine) ou « 12.500 ». Refuse le reste.
export function parseViews(input: string): { ok: true; value: number } | { ok: false; error: string } {
  const compact = input.trim().replace(/[\s  .]/g, '');
  if (!/^\d{1,10}$/.test(compact)) return { ok: false, error: ERROR };
  const value = Number(compact);
  if (value > 2_000_000_000) return { ok: false, error: ERROR };
  return { ok: true, value };
}

export function shareText(caption: string, hashtags: string[]): string {
  return hashtags.length ? `${caption}\n\n${hashtags.join(' ')}` : caption;
}
