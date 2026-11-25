# Minice Studio Clip

Mini-séries dramatiques générées par IA pour TikTok, qui transmettent des leçons de vie et la foi chrétienne. V1 gratuite, mode « Pas à pas » : les textes passent par Claude en copier-coller, les clips viennent d'outils vidéo gratuits, l'appli fait le reste (bibles des comptes, prompts, montage, validation, publication, suivi des vues).

- Conception : `docs/superpowers/specs/2026-11-25-minice-studio-clip-design.md`
- Plan de construction : `docs/superpowers/plans/2026-11-25-minice-studio-clip-v1.md`
- Test des outils vidéo gratuits : `docs/test-modeles-video.md`
- Vérification de bout en bout : `docs/verification-v1.md`

## Pile technique

Next.js 16 (App Router, `src/proxy.ts`), TypeScript strict, Tailwind CSS 4, Supabase (Postgres + RLS, Auth par lien email, Storage privé), zod, ffmpeg.wasm (montage dans le navigateur), Vitest.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis remplir les 4 variables
npm run dev
```

## Mettre en ligne (0 €)

1. **Supabase** (offre gratuite) : créer un projet, puis
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-du-projet>
   npx supabase db push
   ```
   Dans *Authentication > URL Configuration*, mettre l'adresse du site en *Site URL* (par exemple `https://minice-studio-clip.vercel.app`) et ajouter `https://…/auth/callback` et `https://…/auth/confirm` dans les adresses de redirection.

   Dans *Authentication > Emails > Magic Link*, remplacer le lien du modèle par :
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```
   Ainsi le lien marche même s'il est ouvert sur un autre appareil que celui qui l'a demandé (par exemple demandé sur l'ordinateur, ouvert sur le téléphone).
2. **Vercel** : importer le dépôt GitHub, ajouter les 4 variables de `.env.example` (avec l'adresse Vercel dans `NEXT_PUBLIC_SITE_URL` et ton adresse email dans `ALLOWED_EMAILS`), déployer.
3. Te connecter une première fois. Ensuite, dans *Authentication > Sign In / Providers*, désactiver *Allow new users to sign up* : plus personne ne peut créer de compte, même en appelant Supabase directement. Pour ouvrir l'appli à quelqu'un plus tard, ajouter son adresse dans `ALLOWED_EMAILS` et réactiver l'option le temps de sa première connexion.
4. Dérouler `docs/verification-v1.md`.

## Tests

```bash
npm test          # tests de l'appli (Vitest)
npm run test:db   # tests de la base (pgTAP) sur un PostgreSQL local, sans Docker
```

Avec Docker et la CLI Supabase, `npx supabase start && npx supabase test db` lance les mêmes tests de base.

## Bon à savoir

- Les fichiers lourds (clips, images de référence, vidéo montée) partent directement du navigateur vers Supabase Storage. Chaque fichier est rangé sous un dossier qui porte l'identifiant de son propriétaire, et la RLS empêche tout accès croisé.
- Limites de l'offre gratuite de Supabase : 50 Mo par fichier (les buckets refusent au-delà : 5 Mo pour une image, 50 Mo pour un clip ou une vidéo) et 1 Go de stockage en tout. Pour tenir dans 1 Go, les clips sont supprimés dès qu'un épisode est publié ou rejeté, et la vidéo montée est supprimée au rejet. Une vidéo publiée reste (environ 10 à 20 Mo) : une soixantaine d'épisodes publiés tiennent avant de devoir faire du tri.
- Accès : seules les adresses de `ALLOWED_EMAILS` reçoivent un lien de connexion.
- ffmpeg.wasm : la partie JavaScript est copiée dans `public/ffmpeg` (Turbopack ne sait pas empaqueter son worker), le cœur est chargé depuis unpkg (`@ffmpeg/core@0.12.10`).
- Police des sous-titres : Poppins SemiBold (`public/fonts`, licence OFL).
- `src/lib/db/types.ts` est écrit à la main ; une fois le projet lié, le régénérer avec `npx supabase gen types typescript --linked > src/lib/db/types.ts`.
