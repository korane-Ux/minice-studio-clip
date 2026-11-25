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
cp .env.example .env.local   # puis remplir les 3 variables
npm run dev
```

## Mettre en ligne (0 €)

1. **Supabase** (offre gratuite) : créer un projet, puis
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-du-projet>
   npx supabase db push
   ```
   Dans *Authentication > URL Configuration*, ajouter l'adresse du site (par exemple `https://minice-studio-clip.vercel.app`) et `https://…/auth/callback` dans les adresses de redirection.
2. **Vercel** : importer le dépôt GitHub, ajouter les 3 variables de `.env.example` (avec l'adresse Vercel dans `NEXT_PUBLIC_SITE_URL`), déployer.
3. Dérouler `docs/verification-v1.md`.

## Tests

```bash
npm test          # tests de l'appli (Vitest)
npm run test:db   # tests de la base (pgTAP) sur un PostgreSQL local, sans Docker
```

Avec Docker et la CLI Supabase, `npx supabase start && npx supabase test db` lance les mêmes tests de base.

## Bon à savoir

- Les fichiers lourds (clips, images de référence, vidéo montée) partent directement du navigateur vers Supabase Storage. Chaque fichier est rangé sous un dossier qui porte l'identifiant de son propriétaire, et la RLS empêche tout accès croisé.
- ffmpeg.wasm : la partie JavaScript est copiée dans `public/ffmpeg` (Turbopack ne sait pas empaqueter son worker), le cœur est chargé depuis unpkg (`@ffmpeg/core@0.12.10`).
- Police des sous-titres : Poppins SemiBold (`public/fonts`, licence OFL).
- `src/lib/db/types.ts` est écrit à la main ; une fois le projet lié, le régénérer avec `npx supabase gen types typescript --linked > src/lib/db/types.ts`.
