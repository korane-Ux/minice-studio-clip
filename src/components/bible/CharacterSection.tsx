'use client';
import { deleteCharacter, setCharacterImage, upsertCharacter } from '@/app/comptes/[id]/actions';
import type { Character } from '@/lib/domain/types';
import { uploadToBucket } from '@/lib/storage/upload';
import { CharacterCard } from './CharacterCard';

export function CharacterSection({
  accountId,
  userId,
  characters,
  imageUrls,
}: {
  accountId: string;
  userId: string;
  characters: Character[];
  imageUrls: Record<string, string>;
}) {
  async function onImage(characterId: string, file: File, ext: 'png' | 'jpg' | 'webp') {
    const path = `${userId}/${characterId}.${ext}`;
    const up = await uploadToBucket('refs', path, file);
    if (!up.ok) return up;
    return setCharacterImage(characterId, path, accountId);
  }
  const onSave = (fd: FormData) => upsertCharacter(accountId, fd);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      {characters.map((c) => (
        <CharacterCard
          key={c.id}
          character={c}
          imageUrl={c.refImagePath ? (imageUrls[c.refImagePath] ?? null) : null}
          onSave={onSave}
          onImage={onImage}
          onDelete={() => deleteCharacter(c.id, accountId)}
        />
      ))}
      <CharacterCard key={`new-${characters.length}`} character={null} imageUrl={null} onSave={onSave} onImage={onImage} />
    </div>
  );
}
