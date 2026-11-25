'use client';
import { useActionState, useState } from 'react';
import type { FormResult } from '@/app/comptes/[id]/actions';
import type { Character } from '@/lib/domain/types';

const field = 'min-h-11 rounded-ctrl border border-line bg-surface-2 px-3 text-sm text-text';

export function CharacterCard({
  character,
  imageUrl,
  onSave,
  onDelete,
}: {
  character: Character | null;
  imageUrl: string | null;
  onSave: (fd: FormData) => Promise<FormResult>;
  onDelete?: () => Promise<FormResult>;
}) {
  const [editing, setEditing] = useState(character === null);
  const [state, submit, pending] = useActionState<FormResult | null, FormData>(async (_p, fd) => {
    const r = await onSave(fd);
    if (r.ok && character) setEditing(false);
    return r;
  }, null);

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
    <form action={submit} className="flex flex-col gap-3 rounded-card border border-dashed border-line bg-surface-2 p-4">
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
      {state && !state.ok && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
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
