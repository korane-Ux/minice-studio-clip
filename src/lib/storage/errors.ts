// Traduit les refus de Supabase Storage en messages utiles.
export function uploadErrorMessage(error: { message?: string; statusCode?: string | number }): string {
  const status = String(error.statusCode ?? '');
  const msg = (error.message ?? '').toLowerCase();
  if (msg.includes('quota')) return 'Ton stockage gratuit est plein (1 Go). Publie ou rejette des épisodes pour libérer de la place.';
  if (status === '413' || msg.includes('maximum allowed size') || msg.includes('too large')) {
    return 'Fichier trop lourd pour le stockage gratuit (50 Mo maximum). Exporte-le en qualité plus basse et réessaie.';
  }
  if (status === '415' || msg.includes('mime type')) {
    return 'Format refusé par le stockage. Utilise un fichier MP4, WebM ou MOV (PNG, JPG ou WebP pour les images).';
  }
  return "L'envoi du fichier a échoué. Vérifie ta connexion et réessaie.";
}
