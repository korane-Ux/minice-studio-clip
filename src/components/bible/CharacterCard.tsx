'use client';
import { useState, useTransition, type FormEvent } from 'react';
import type { FormResult } from '@/app/comptes/[id]/actions';
import type { Character } from '@/lib/domain/types';
import { validateRefImage } from '@/lib/validation/account';

const field = 'min-h-11 rounded-ctrl border border-line bg-surface-2 px-3 text-sm text-text';

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

export function CharacterCard({
  character,
  imageUrl,
  onSave,
  onImage,
  onDelete,
}: {
  character: Character | null;
  imageUrl: string | null;
  onSave: (fd: FormData) => Promise<SaveResult>;
  onImage: (characterId: string, file: File, ext: 'png' | 'jpg' | 'webp') => Promise<FormResult>;
  onDelete?: () => Promise<FormResult>;
}) {
  const [editing, setEditing] = useState(character === null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Fichier lu sur le champ lui-même (FormData le recopie mal dans certains environnements).
    const file = (form.querySelector('input[name=image]') as HTMLInputElement | null)?.files?.[0] ?? null;
    fd.delete('image');
    const hasFile = !!file && file.size > 0;
    let ext: 'png' | 'jpg' | 'webp' | null = null;
    if (hasFile) {
      const check = validateRefImage(file!);
      if (!check.ok) return setError(check.error);
      ext = check.ext;
    }
    start(async () => {
      const saved = await onSave(fd);
      if (!saved.ok) return setError(saved.error);
      if (hasFile && ext) {
        const img = await onImage(saved.id, file!, ext);
        if (!img.ok) return setError(img.error);
      }
      if (character) setEditing(false);
      else form.reset();
    });
  }

  if (!editing && character) {
    return (
      <article className="overflow-hidden rounded-card border border-line bg-surface-2">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`Référence de ${character.name}`} className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 items-center justify-center bg-[#8A8F9C] p-3 text-center text-xs font-semibold text-ink">
            Image de référence en pied · fond gris uni
          </div>
        )}
        <div className="flex flex-col gap-1 p-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ background: character.color }} />
            {character.name}
          </h3>
          <p className="text-sm text-muted">{character.description}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="min-h-10 rounded-full border border-line px-4 text-sm">
              Modifier
            </button>
            {onDelete && (
              <button type="button" onClick={() => onDelete()} className="min-h-10 rounded-full px-4 text-sm text-danger">
                Supprimer
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-card border border-dashed border-line bg-surface-2 p-4">
      {character && <input type="hidden" name="id" value={character.id} />}
      <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
        Nom
        <input name="name" defaultValue={character?.name} required maxLength={40} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
        Description (apparence et caractère)
        <textarea name="description" defaultValue={character?.description} maxLength={300} rows={3} className={`${field} py-2`} />
      </label>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
          Couleur dominante
          <input type="color" name="color" defaultValue={character?.color ?? '#8880F0'} className="h-11 w-20 rounded-ctrl border border-line bg-surface-2" />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-semibold text-muted">
          Image de référence (PNG, JPEG ou WebP, 5 Mo max)
          <input type="file" name="image" accept="image/png,image/jpeg,image/webp" className="text-sm text-text" />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="min-h-10 rounded-full bg-violet px-5 text-sm font-semibold text-ink disabled:opacity-60">
          {pending ? 'Enregistrement…' : character ? 'Enregistrer' : 'Ajouter le personnage'}
        </button>
        {character && (
          <button type="button" onClick={() => setEditing(false)} className="min-h-10 rounded-full px-4 text-sm text-muted">
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
