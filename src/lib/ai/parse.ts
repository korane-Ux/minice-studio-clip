import type { z } from 'zod';

export type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };

const NO_JSON = "Je n'ai pas trouvé de JSON dans la réponse. Copie toute la réponse de Claude.";
const BROKEN = 'La réponse de Claude est coupée ou mal formée. Copie toute la réponse, du début à la fin.';

function extractJson(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1].includes('{')) return fenced[1].trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  return raw.slice(start, end + 1);
}

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    try {
      return JSON.parse(text.replace(/,\s*([}\]])/g, '$1'));
    } catch {
      return undefined;
    }
  }
}

export function parseAiResponse<T>(raw: string, schema: z.ZodType<T>): ParseResult<T> {
  const json = extractJson(raw);
  if (json === null) return { ok: false, error: NO_JSON };
  const value = tryParse(json);
  if (value === undefined) return { ok: false, error: BROKEN };

  const result = schema.safeParse(value);
  if (result.success) return { ok: true, data: result.data };

  const issue = result.error.issues[0];
  const path = issue.path.length ? issue.path.join('.') : 'réponse';
  return {
    ok: false,
    error: `La réponse ne respecte pas le format : ${path} ${issue.message}. Redemande à Claude en recollant le texte de départ.`,
  };
}
