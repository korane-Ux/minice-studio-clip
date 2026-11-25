import { z } from 'zod';

z.config(z.locales.fr());

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'couleur au format #RRGGBB');
const chips = z.array(z.string().trim().min(1).max(40)).max(12);

export const accountUpdateSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: hex,
  style: z.enum(['animation_3d', 'anime_2d', 'realiste']),
  contentFocus: z.string().trim().max(200),
  tone: z.string().trim().max(200),
  targetDurationS: z.union([z.literal(20), z.literal(30), z.literal(40)]),
  lessonFormat: z.enum(['verset', 'phrase_personnage', 'phrase_ecran']),
  coreValues: chips,
  themes: chips,
  exclusions: chips,
  autopilotCadence: z.number().int().min(1).max(14),
  autopilotConfirm: z.boolean(),
  autoCheck: z.boolean(),
});
export type AccountUpdate = z.infer<typeof accountUpdateSchema>;

export function accountFromForm(fd: FormData): Record<string, unknown> {
  const str = (k: string) => String(fd.get(k) ?? '');
  const list = (k: string) => fd.getAll(k).map(String);
  return {
    name: str('name'),
    color: str('color'),
    style: str('style'),
    contentFocus: str('contentFocus'),
    tone: str('tone'),
    targetDurationS: Number(str('targetDurationS')),
    lessonFormat: str('lessonFormat'),
    coreValues: list('coreValues'),
    themes: list('themes'),
    exclusions: list('exclusions'),
    autopilotCadence: Number(str('autopilotCadence')),
    autopilotConfirm: str('autopilotConfirm') === 'true',
    autoCheck: str('autoCheck') === 'true',
  };
}

export const characterSchema = z.object({
  name: z.string().trim().min(1).max(40),
  description: z.string().trim().max(300),
  color: hex,
});

const IMAGE_TYPES: Record<string, 'png' | 'jpg' | 'webp'> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
const MAX_IMAGE = 5 * 1024 * 1024;

export function validateRefImage(file: { type: string; size: number }): { ok: true; ext: 'png' | 'jpg' | 'webp' } | { ok: false; error: string } {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { ok: false, error: 'Image refusée : PNG, JPEG ou WebP uniquement.' };
  if (file.size > MAX_IMAGE) return { ok: false, error: 'Image trop lourde : 5 Mo maximum.' };
  return { ok: true, ext };
}
