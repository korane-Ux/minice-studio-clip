// Erreur liée à un clip précis : l'utilisateur sait quelle scène corriger.
export class MontageClipError extends Error {
  constructor(
    public readonly position: number,
    public readonly kind: 'read' | 'download' = 'read',
  ) {
    super(`Clip de la scène ${position} : ${kind === 'read' ? 'illisible' : 'téléchargement impossible'}`);
    this.name = 'MontageClipError';
  }
}

export function montageErrorMessage(error: unknown): string {
  if (error instanceof MontageClipError) {
    return error.kind === 'read'
      ? `Le clip de la scène ${error.position} n'a pas pu être lu. Remplace-le, puis relance le montage.`
      : `Le clip de la scène ${error.position} n'a pas pu être téléchargé. Recharge la page, puis relance le montage.`;
  }
  return 'Le montage a échoué. Réessaie depuis un ordinateur.';
}
