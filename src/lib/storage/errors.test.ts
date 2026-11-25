import { expect, test } from 'vitest';
import { uploadErrorMessage } from './errors';

test('fichier trop lourd pour Supabase : message clair', () => {
  expect(uploadErrorMessage({ statusCode: '413', message: 'The object exceeded the maximum allowed size' })).toBe(
    'Fichier trop lourd pour le stockage gratuit (50 Mo maximum). Exporte-le en qualité plus basse et réessaie.',
  );
  expect(uploadErrorMessage({ message: 'Payload too large' })).toMatch(/trop lourd/);
});

test('format refusé par le stockage', () => {
  expect(uploadErrorMessage({ statusCode: '415', message: 'mime type video/x-matroska is not supported' })).toBe(
    'Format refusé par le stockage. Utilise un fichier MP4, WebM ou MOV (PNG, JPG ou WebP pour les images).',
  );
});

test('stockage plein', () => {
  expect(uploadErrorMessage({ message: 'Storage quota exceeded' })).toBe(
    'Ton stockage gratuit est plein (1 Go). Publie ou rejette des épisodes pour libérer de la place.',
  );
});

test('autre erreur : message réseau', () => {
  expect(uploadErrorMessage({ message: 'Failed to fetch' })).toBe("L'envoi du fichier a échoué. Vérifie ta connexion et réessaie.");
});
