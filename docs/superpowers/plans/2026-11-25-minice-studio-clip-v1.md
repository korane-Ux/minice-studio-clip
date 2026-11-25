# Minice Studio Clip V1 (mode « Pas à pas ») Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire la V1 gratuite de Minice Studio Clip : bibles de comptes modifiables, idées et scripts par copier-coller avec Claude, prompts vidéo par scène, dépôt des clips, montage dans le navigateur, validation, publication depuis le téléphone et suivi des vues.

**Architecture:** Application Next.js (App Router, TypeScript strict) adossée à Supabase (Postgres avec Row Level Security, Auth par lien email, Storage privé). Toute la logique métier (statuts, prompts, lecture des réponses de Claude, sous-titres, arguments ffmpeg) vit dans des modules TypeScript purs et testés sous `src/lib/`. Le montage tourne dans le navigateur avec ffmpeg.wasm. Chaque étape IA est décrite par un objet `AiStep` (prompt + schéma de réponse) pour que la V2 (pilote automatique) branche un mode API sans toucher au reste.

**Tech Stack:** Next.js (App Router, version stable courante), TypeScript strict, Tailwind CSS, Supabase (Postgres, Auth, Storage, CLI locale, pgTAP), zod, @ffmpeg/ffmpeg (ffmpeg.wasm), Vitest, @testing-library/react, jsdom, hébergement Vercel.

**Spec:** `docs/superpowers/specs/2026-11-25-minice-studio-clip-design.md` (v3). Maquettes de référence : https://claude.ai/artifact/CC6wrK31R5VzdLQDAb2WfL

**Hors de ce plan :** le pilote automatique, la page de saisie des clés API, leur chiffrement et les tâches planifiées font l'objet d'un **plan 2** séparé. Ce plan pose seulement les points d'accroche (réglages stockés, interface `AiStep`).

## Global Constraints

- Coût : 0 €. Aucun service payant, aucune clé API requise en V1. Supabase et Vercel en offre gratuite.
- Toute l'interface est en français. Aucun tiret cadratin (—) dans les textes de l'interface, phrases simples.
- Chaque table a une colonne `user_id uuid not null default auth.uid()` et une politique RLS `user_id = auth.uid()` pour select, insert, update, delete. Buckets Storage privés, chemins préfixés par `{user_id}/`.
- Format vidéo : vertical 9:16, sortie 720x1280, 30 images/s. Épisode de 20 à 40 secondes (cible 30). 3 à 5 scènes. Chaque scène dure au plus 8 secondes.
- Couleurs : fond `#0B1120`, barre latérale `#0E1527`, carte `#131C30`, bordures `#1F2A44` et `#2E3A5C`, texte `#F4F3FD`, texte secondaire `#B4BAD1`, accent `#8C86F8` avec texte `#0F1A2C` dessus, avertissement `#FBBF24`. Couleurs de comptes : `#2DD4BF` (Fables de la Mer), `#FBBF24` (Paraboles), `#F472B6` (Le Marché).
- Polices : Quicksand (titres), Nunito (texte). Mascotte Minice comme icône (`public/brand/minice-icon.png`).
- Zones cliquables d'au moins 44 px, vrais `<button>` et `<a>`, contraste texte 4,5:1 minimum.
- Valeurs par défaut des bibles : humilité, honnêteté, pardon, famille, persévérance, foi. Exclusions par défaut : adultère, vengeance cruelle, grossesses cachées, gore, scènes sexuelles.
- Citations bibliques : traduction Louis Segond 1910, avec la référence.
- Le label « Contenu généré par IA » est rappelé à chaque publication.
- Ne jamais committer `.env.local`. Seul `.env.example` est versionné.

## Review Focus

1. **Réponse de Claude collée de travers** (texte autour du JSON, virgule en trop, champ manquant, 6 scènes au lieu de 5) : message clair en français, rien n'est enregistré. Testé dans la tâche 5 et la tâche 9.
2. **Clip au mauvais format** (`.avi`, fichier de 500 Mo, vidéo horizontale) : les formats non pris en charge et les fichiers trop lourds sont refusés avec un message ; une vidéo horizontale est acceptée puis recadrée en 9:16 au montage. Testé dans la tâche 10 et la tâche 11.
3. **Un autre utilisateur qui devine une URL ou un chemin de fichier** : aucune ligne ni aucun fichier d'un autre utilisateur n'est lisible ou modifiable. Testé dans la tâche 2.
4. **Montage qui échoue** (téléphone sans assez de mémoire, clip corrompu) : message « Le montage a échoué. Réessaie depuis un ordinateur. », l'épisode reste à l'étape montage et peut être relancé. Testé dans la tâche 11.
5. **Dialogues avec caractères spéciaux** (« », ’, accolades, retours à la ligne, virgules) : les sous-titres s'affichent tels quels sans casser le fichier de sous-titres. Testé dans la tâche 11.

---

## Structure des fichiers

```
src/
  app/
    layout.tsx, globals.css, page.tsx (Accueil)
    connexion/page.tsx, connexion/actions.ts
    auth/callback/route.ts
    comptes/page.tsx, comptes/[id]/page.tsx, comptes/[id]/actions.ts
    episodes/[id]/page.tsx, episodes/[id]/actions.ts, episodes/[id]/scene-actions.ts
    studio/page.tsx (redirige vers le dernier épisode en cours)
    publier/page.tsx, publier/[id]/page.tsx, publier/actions.ts
    import/page.tsx, import/actions.ts
    cles-api/page.tsx
    actions/startEpisode.ts
  components/
    shell/ (AppShell, RailNav)
    home/ (HeroPrompt, ModeToggle, EpisodeGrid, EpisodeCard)
    bible/ (ChipsField, CharacterCard, AutopilotCard)
    studio/ (Stepper, CopyPasteStep, IdeaPicker, SceneList, ScenePanel, MontageStep, ValidationStep)
    publish/ (PublishPanel)
  lib/
    design/tokens.ts
    supabase/ (server.ts, client.ts)
    domain/ (types.ts, status.ts, stats.ts)
    ai/ (schemas.ts, parse.ts, steps.ts, prompts/*.ts)
    video/ (scenePrompt.ts, clipFile.ts, tools.ts)
    montage/ (subtitles.ts, ffmpegArgs.ts, runMontage.ts)
    validation/ (account.ts, views.ts)
supabase/
  migrations/*.sql
  tests/*.test.sql
public/brand/minice-icon.png, public/fonts/Nunito-Bold.ttf
```

---

### Task 1: Socle du projet et coquille visuelle

**Files:**
- Create: projet Next.js à la racine (`create-next-app` avec TypeScript, App Router, Tailwind, dossier `src/`)
- Create: `vitest.config.ts`, `src/test/setup.ts`
- Create: `src/lib/design/tokens.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`
- Create: `src/components/shell/RailNav.tsx`, `src/components/shell/AppShell.tsx`
- Create: `public/brand/minice-icon.png` (icône fournie par Arthur, carré 256 px)
- Test: `src/components/shell/RailNav.test.tsx`

**Interfaces:**
- Produces: `type NavKey = 'creer' | 'episodes' | 'studio' | 'comptes' | 'publier' | 'cles'`
- Produces: `AppShell({ active, children }: { active: NavKey; children: React.ReactNode })`
- Produces: `tokens` (objet des couleurs des Global Constraints) et `ACCOUNT_COLORS: readonly string[]`

- [ ] **Step 1: Créer le projet et l'outillage de test**

Run: `npx create-next-app@latest minice-studio-clip --ts --app --tailwind --src-dir --eslint`, puis `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`. `tsconfig.json` : `"strict": true`. Script `"test": "vitest run"`.

- [ ] **Step 2: Écrire le test qui échoue**

```tsx
import { render, screen } from '@testing-library/react';
import { RailNav } from './RailNav';

test('affiche les 6 entrées dans l’ordre avec leurs liens', () => {
  render(<RailNav active="comptes" />);
  const links = screen.getAllByRole('link').filter((l) => l.textContent);
  expect(links.map((l) => l.textContent)).toEqual(['Créer', 'Épisodes', 'Studio', 'Comptes', 'Publier', 'Clés API']);
  expect(links.map((l) => l.getAttribute('href'))).toEqual(['/', '/?vue=episodes', '/studio', '/comptes', '/publier', '/cles-api']);
});

test('marque l’entrée active et affiche le badge GRATUIT', () => {
  render(<RailNav active="comptes" />);
  expect(screen.getByRole('link', { name: 'Comptes' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('GRATUIT')).toBeInTheDocument();
});
```

- [ ] **Step 3: Lancer le test et vérifier qu'il échoue**

Run: `npx vitest run src/components/shell`
Expected: FAIL, module `./RailNav` introuvable.

- [ ] **Step 4: Implémenter `RailNav({ active }: { active: NavKey })` et `AppShell`**

Barre d'icônes à gauche comme sur la maquette (icône Minice en haut, icône + libellé par entrée, badge « GRATUIT » et pastille profil en bas ; passe en ligne horizontale sous 720 px). Polices via `next/font/google` (Quicksand 500/600/700, Nunito 400/600/700/800) exposées en variables CSS. Couleurs déclarées une seule fois en variables CSS dans `globals.css` et reprises dans `tokens.ts`.

- [ ] **Step 5: Lancer les tests et le build**

Run: `npx vitest run src/components/shell && npm run build`
Expected: PASS, build sans erreur.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: socle Next.js, coquille et barre latérale Minice"
```

---

### Task 2: Base de données, sécurité et stockage

**Files:**
- Create: `supabase/config.toml` (via `supabase init`)
- Create: `supabase/migrations/20261125000001_schema.sql`
- Create: `supabase/migrations/20261125000002_rls.sql`
- Create: `supabase/migrations/20261125000003_storage.sql`
- Create: `supabase/migrations/20261125000004_functions.sql`
- Test: `supabase/tests/rls.test.sql`, `supabase/tests/functions.test.sql`
- Create: `src/lib/db/types.ts` (généré)

**Interfaces:**
- Produces (types SQL) : `account_style` = `'animation_3d' | 'anime_2d' | 'realiste'` ; `lesson_format` = `'verset' | 'phrase_personnage' | 'phrase_ecran'` ; `episode_status` = `'idee' | 'scenes' | 'montage' | 'a_valider' | 'valide' | 'publie' | 'rejete'`
- Produces (tables) :
  - `accounts(id, user_id, name, color, tiktok_handle, style, content_focus, tone, target_duration_s int check in (20,30,40) default 30, lesson_format, values text[], themes text[], exclusions text[], series_summary text default '', autopilot_cadence int default 3, autopilot_confirm bool default true, auto_check bool default true, position int, created_at)`
  - `characters(id, user_id, account_id → accounts on delete cascade, name, description, color, ref_image_path, position int, created_at)`
  - `episodes(id, user_id, account_id → accounts on delete cascade, number int, title, idea jsonb, status episode_status default 'idee', lesson, caption, hashtags text[], video_path, validated_at, published_at, views int check (views >= 0), views_updated_at, created_at)`, unique `(account_id, number)`
  - `scenes(id, user_id, episode_id → episodes on delete cascade, position int, start_s numeric, duration_s numeric check (duration_s > 0 and duration_s <= 8), visual, dialogue, character_ids uuid[], prompt, clip_path, created_at)`, unique `(episode_id, position)`
- Produces (buckets privés) : `refs`, `clips`, `videos`
- Produces (fonctions SQL) :
  - `seed_default_accounts() returns int` : crée les 3 comptes du spec pour `auth.uid()` s'il n'en a aucun, renvoie le nombre créé.
  - `import_script(p_episode_id uuid, p_payload jsonb) returns void` : en une transaction, met à jour titre, leçon, légende, hashtags, remplace les scènes, passe le statut à `'scenes'`.
  - `import_batch(p_account_id uuid, p_payload jsonb) returns int` : crée N épisodes numérotés à la suite avec leurs scènes, au statut `'scenes'`, tout ou rien.

Valeurs de `seed_default_accounts()` (spec, section 6) :

| position | name | color | style | content_focus | lesson_format | themes |
|---|---|---|---|---|---|---|
| 1 | Fables de la Mer | #2DD4BF | animation_3d | Fables modernes : leçons de vie et valeurs | phrase_personnage | {Fables modernes} |
| 2 | Paraboles | #FBBF24 | anime_2d | Paraboles et récits bibliques mis en scène | verset | {Paraboles de Jésus, Récits de l'Ancien Testament} |
| 3 | Le Marché | #F472B6 | realiste | Sagas familiales et réussites méritées, avec une morale | phrase_personnage | {Sagas familiales, Réussites méritées} |

Pour les trois : `values` et `exclusions` = valeurs par défaut des Global Constraints, `tone` = `'Émouvant, respectueux, toujours une note d''espoir'`.

- [ ] **Step 1: Écrire les tests pgTAP qui échouent**

`supabase/tests/rls.test.sql` crée deux utilisateurs A et B dans `auth.users`, un compte, un personnage, un épisode et une scène pour A, puis, en se faisant passer pour B (`set local role authenticated; set local request.jwt.claims = '{"sub":"<B>"}'`) :

```sql
select is((select count(*)::int from accounts), 0, 'B ne voit aucun compte de A');
select is((select count(*)::int from characters), 0, 'B ne voit aucun personnage de A');
select is((select count(*)::int from episodes), 0, 'B ne voit aucun épisode de A');
select is((select count(*)::int from scenes), 0, 'B ne voit aucune scène de A');
select is((with u as (update episodes set title = 'pirate' returning 1) select count(*)::int from u), 0, 'B ne modifie rien chez A');
select throws_ok($$ insert into accounts (user_id, name, color, style, content_focus, lesson_format) values ('<A>', 'x', '#000000', 'realiste', 'x', 'verset') $$, '42501', null, 'B ne peut pas écrire au nom de A');
select is((select count(*)::int from storage.objects where bucket_id = 'clips'), 0, 'B ne voit aucun clip de A');
```

`supabase/tests/functions.test.sql`, en tant que A :

```sql
select is(seed_default_accounts(), 3, 'premier appel : 3 comptes créés');
select is(seed_default_accounts(), 0, 'deuxième appel : rien de plus');
select results_eq($$ select name, color from accounts order by position $$,
  $$ values ('Fables de la Mer','#2DD4BF'), ('Paraboles','#FBBF24'), ('Le Marché','#F472B6') $$);
select throws_ok($$ select import_script('<episode>', '{"title":"t","lesson":"l","caption":"c","hashtags":["#a"],"scenes":[{"position":1,"start_s":0,"duration_s":9,"visual":"v","dialogue":"d","character_ids":[],"prompt":"p"}]}') $$,
  '23514', null, 'scène de 9 s refusée, rien importé');
select is((select count(*)::int from scenes where episode_id = '<episode>'), 0, 'aucune scène après l’échec');
```

- [ ] **Step 2: Lancer les tests et vérifier qu'ils échouent**

Run: `supabase start && supabase test db`
Expected: FAIL, tables et fonctions absentes.

- [ ] **Step 3: Écrire les migrations**

Schéma, RLS (4 politiques par table, `user_id = auth.uid()`), buckets privés avec politiques Storage `(storage.foldername(name))[1] = auth.uid()::text`, puis les trois fonctions en `security invoker` (la RLS s'applique donc aussi dedans).

- [ ] **Step 4: Relancer les tests**

Run: `supabase db reset && supabase test db`
Expected: tous les tests `ok`.

- [ ] **Step 5: Générer les types et committer**

Run: `supabase gen types typescript --local > src/lib/db/types.ts`

```bash
git add supabase src/lib/db && git commit -m "feat: schéma, RLS, stockage privé et fonctions d'import"
```

---

### Task 3: Connexion par lien email

**Files:**
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- Create: `src/middleware.ts`
- Create: `src/app/connexion/page.tsx`, `src/app/connexion/actions.ts`
- Create: `src/app/auth/callback/route.ts`
- Create: `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`)
- Test: `src/app/connexion/actions.test.ts`, `src/middleware.test.ts`

**Interfaces:**
- Consumes: `Database` de `src/lib/db/types.ts`, `seed_default_accounts()` (tâche 2)
- Produces: `createServerSupabase(): SupabaseClient<Database>`, `createBrowserSupabase(): SupabaseClient<Database>`
- Produces: `requireUser(): Promise<User>` (redirige vers `/connexion` sans session)
- Produces: `sendMagicLink(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }>`
- Produces: `isPublicPath(pathname: string): boolean`

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('refuse une adresse invalide', async () => {
  const fd = new FormData(); fd.set('email', 'arthur@');
  expect(await sendMagicLink(fd)).toEqual({ ok: false, error: 'Adresse email invalide.' });
});

test('envoie le lien avec la bonne adresse de retour', async () => {
  const fd = new FormData(); fd.set('email', 'arthur@example.com');
  expect(await sendMagicLink(fd)).toEqual({ ok: true });
  expect(signInWithOtp).toHaveBeenCalledWith({ email: 'arthur@example.com', options: { emailRedirectTo: 'http://localhost:3000/auth/callback' } });
});

test('chemins publics', () => {
  expect(isPublicPath('/connexion')).toBe(true);
  expect(isPublicPath('/auth/callback')).toBe(true);
  expect(isPublicPath('/')).toBe(false);
  expect(isPublicPath('/episodes/123')).toBe(false);
});
```

(`signInWithOtp` est un mock de `createServerSupabase().auth.signInWithOtp` ; `NEXT_PUBLIC_SITE_URL=http://localhost:3000` dans `src/test/setup.ts`.)

- [ ] **Step 2: Lancer les tests et vérifier qu'ils échouent**

Run: `npx vitest run src/app/connexion src/middleware.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implémenter**

Clients avec `@supabase/ssr`. Middleware qui rafraîchit la session et redirige vers `/connexion` hors chemins publics. Callback : échange du code, appel de `seed_default_accounts()`, redirection vers `/`. Page de connexion dans le style des maquettes : mascotte, « Connexion sans mot de passe », champ email, bouton « Recevoir mon lien », message « Lien envoyé. Ouvre ta boîte mail. »

- [ ] **Step 4: Relancer les tests**

Run: `npx vitest run src/app/connexion src/middleware.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: connexion par lien email et création des 3 comptes par défaut"
```

---

### Task 4: Modèle métier (statuts, semaine, statistiques, verdict)

**Files:**
- Create: `src/lib/domain/types.ts`, `src/lib/domain/status.ts`, `src/lib/domain/stats.ts`
- Test: `src/lib/domain/status.test.ts`, `src/lib/domain/stats.test.ts`

**Interfaces:**
- Produces: `Account`, `Character`, `Episode`, `Scene` (types TS alignés sur les tables, en camelCase)
- Produces: `type EpisodeStatus = 'idee' | 'scenes' | 'montage' | 'a_valider' | 'valide' | 'publie' | 'rejete'`
- Produces: `type EpisodeEvent = { type: 'SCRIPT_IMPORTED' } | { type: 'CLIPS_CHANGED'; allPresent: boolean } | { type: 'VIDEO_ASSEMBLED' } | { type: 'APPROVED' } | { type: 'REDO_SCENE' } | { type: 'REJECTED' } | { type: 'PUBLISHED' }`
- Produces: `transition(status: EpisodeStatus, event: EpisodeEvent): EpisodeStatus` (lève `InvalidTransitionError`)
- Produces: `statusLabel(status: EpisodeStatus, clips?: { done: number; total: number }): { label: string; tone: 'attente' | 'pret' | 'en_cours' | 'publie' | 'rejete' }`
- Produces: `weekRange(now: Date): { start: Date; end: Date }` (lundi 00:00 à lundi suivant 00:00, heure de Paris)
- Produces: `accountStats(episodes: Episode[], now: Date): { thisWeek: number; avgViews: number | null; best: Episode | null }`
- Produces: `verdict(episodes: Episode[], opts?: { threshold?: number; ratio?: number; min?: number }): 'pas_assez' | 'prend' | 'ne_prend_pas'`

Transitions autorisées (toutes les autres lèvent l'erreur) :

| depuis | événement | vers |
|---|---|---|
| idee | SCRIPT_IMPORTED | scenes |
| scenes | CLIPS_CHANGED (allPresent true) | montage |
| scenes | CLIPS_CHANGED (allPresent false) | scenes |
| montage | CLIPS_CHANGED (allPresent false) | scenes |
| montage | VIDEO_ASSEMBLED | a_valider |
| a_valider | APPROVED | valide |
| a_valider | REDO_SCENE | scenes |
| idee, scenes, montage, a_valider | REJECTED | rejete |
| valide | PUBLISHED | publie |

Libellés : `idee` « Script à préparer », `scenes` « Scènes {done} / {total} », `montage` « Prêt pour le montage », `a_valider` « À valider », `valide` « Prêt à publier », `publie` « Publié », `rejete` « Rejeté ».

Verdict (choix du plan, réglable) : `threshold` 10 000, `ratio` 0,5, `min` 3. On ne compte que les épisodes publiés dont les vues sont saisies. Moins de `min` : `'pas_assez'`. Sinon `'prend'` si au moins `ratio` d'entre eux atteignent `threshold`.

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('parcours normal', () => {
  let s: EpisodeStatus = 'idee';
  s = transition(s, { type: 'SCRIPT_IMPORTED' });
  s = transition(s, { type: 'CLIPS_CHANGED', allPresent: true });
  s = transition(s, { type: 'VIDEO_ASSEMBLED' });
  s = transition(s, { type: 'APPROVED' });
  expect(transition(s, { type: 'PUBLISHED' })).toBe('publie');
});
test('refaire une scène renvoie aux scènes', () => expect(transition('a_valider', { type: 'REDO_SCENE' })).toBe('scenes'));
test('on ne publie pas un épisode non validé', () => expect(() => transition('a_valider', { type: 'PUBLISHED' })).toThrow(InvalidTransitionError));
test('libellé des scènes', () => expect(statusLabel('scenes', { done: 2, total: 4 }).label).toBe('Scènes 2 / 4'));

test('semaine de Paris', () => {
  const { start, end } = weekRange(new Date('2026-11-25T23:30:00Z'));
  expect(start.toISOString()).toBe('2026-11-22T23:00:00.000Z');
  expect(end.toISOString()).toBe('2026-11-29T23:00:00.000Z');
});
test('moyenne et meilleur épisode', () => {
  const eps = [pub(1, 4000), pub(2, 12000), pub(3, null)];
  const s = accountStats(eps, new Date('2026-11-25T12:00:00Z'));
  expect(s.avgViews).toBe(8000);
  expect(s.best?.number).toBe(2);
});
test('verdict', () => {
  expect(verdict([pub(1, 20000), pub(2, 15000)])).toBe('pas_assez');
  expect(verdict([pub(1, 20000), pub(2, 15000), pub(3, 900)])).toBe('prend');
  expect(verdict([pub(1, 20000), pub(2, 800), pub(3, 900)])).toBe('ne_prend_pas');
});
```

(`pub(number, views)` est une petite fabrique d'épisodes publiés dans le fichier de test.)

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/domain`
Expected: FAIL.

- [ ] **Step 3: Implémenter `status.ts` et `stats.ts`**

`weekRange` calcule le lundi avec `Intl.DateTimeFormat` sur `Europe/Paris` (pas de dépendance de dates).

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/domain`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/domain && git commit -m "feat: statuts d'épisode, statistiques et verdict"
```

---

### Task 5: Étapes IA en mode manuel (prompts et lecture des réponses)

**Files:**
- Create: `src/lib/ai/schemas.ts`, `src/lib/ai/parse.ts`, `src/lib/ai/steps.ts`
- Create: `src/lib/ai/prompts/context.ts`, `src/lib/ai/prompts/ideas.ts`, `src/lib/ai/prompts/script.ts`, `src/lib/ai/prompts/summary.ts`, `src/lib/ai/prompts/batch.ts`
- Test: `src/lib/ai/parse.test.ts`, `src/lib/ai/prompts/prompts.test.ts`

**Interfaces:**
- Consumes: `Account`, `Character` (tâche 4)
- Produces: `type BibleContext = { account: Account; characters: Character[]; summary: string }`
- Produces: `type Idea = { title: string; pitch: string; lesson: string }`
- Produces: `type SceneDraft = { visual: string; dialogue: string; durationS: number; characters: string[] }` (noms des personnages)
- Produces: `type ScriptDraft = { title: string; lesson: string; caption: string; hashtags: string[]; scenes: SceneDraft[] }`
- Produces: schémas zod `ideasSchema` (`{ ideas: Idea[] }`, exactement 5), `scriptSchema` (ScriptDraft), `summarySchema` (`{ summary: string }`, 1 200 caractères max), `batchSchema` (`{ episodes: ScriptDraft[] }`, 1 à 9)
- Produces: `type AiStep<I, O> = { id: 'idees' | 'script' | 'resume' | 'lot'; buildPrompt(input: I): string; schema: z.ZodType<O> }`
- Produces: `ideasStep: AiStep<{ ctx: BibleContext; hint?: string }, { ideas: Idea[] }>`, `scriptStep: AiStep<{ ctx: BibleContext; idea: Idea }, ScriptDraft>`, `summaryStep: AiStep<{ ctx: BibleContext; script: ScriptDraft }, { summary: string }>`, `batchStep: AiStep<{ ctx: BibleContext; count: number }, { episodes: ScriptDraft[] }>`
- Produces: `parseAiResponse<T>(raw: string, schema: z.ZodType<T>): { ok: true; data: T } | { ok: false; error: string }`

Règles de `scriptSchema` : titre 80 caractères max ; leçon non vide, 160 caractères max ; 3 à 6 hashtags commençant par `#` ; 3 à 5 scènes ; `durationS` entre 2 et 8 ; durée totale entre 20 et 40 secondes.

Chaque prompt contient obligatoirement (le test le vérifie) : le nom du compte, le style en français (« Animation 3D », « Anime 2D », « Réaliste »), le ton, les valeurs, chaque exclusion, chaque personnage avec sa description, le résumé du feuilleton (ou « Début du feuilleton » s'il est vide), « en français », « 9:16 », « accroche dans les 2 premières secondes », la consigne de leçon (pour `verset` : « Louis Segond 1910 » et « référence »), et « Réponds uniquement avec un bloc ```json » suivi d'un exemple de la forme attendue. Le prompt d'idées demande « 5 idées » et reprend l'indication d'Arthur si elle existe.

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
const ok = { title: 'Le crabe', lesson: 'Celui qui partage ne perd jamais rien.', caption: 'c', hashtags: ['#fable', '#leçondevie', '#partage'],
  scenes: [8, 8, 8, 8].map((d) => ({ visual: 'v', dialogue: 'Gaspard : « Tout ça est à moi. »', durationS: d, characters: ['Gaspard'] })) };

test('lit un bloc json entouré de texte', () => {
  const raw = 'Voici le script :\n```json\n' + JSON.stringify(ok) + '\n```\nBonne création !';
  expect(parseAiResponse(raw, scriptSchema)).toEqual({ ok: true, data: ok });
});
test('tolère une virgule en trop', () => {
  const raw = '```json\n{"summary": "Gaspard a appris à partager.",}\n```';
  expect(parseAiResponse(raw, summarySchema)).toEqual({ ok: true, data: { summary: 'Gaspard a appris à partager.' } });
});
test('aucun json', () => {
  expect(parseAiResponse('Désolé, je ne peux pas.', scriptSchema)).toEqual({ ok: false, error: "Je n'ai pas trouvé de JSON dans la réponse. Copie toute la réponse de Claude." });
});
test('trop de scènes', () => {
  const bad = { ...ok, scenes: [...ok.scenes, ...ok.scenes.slice(0, 2)].map((s) => ({ ...s, durationS: 5 })) };
  const r = parseAiResponse(JSON.stringify(bad), scriptSchema);
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error).toContain('scenes');
});
test('le prompt de script contient la bible et les règles', () => {
  const p = scriptStep.buildPrompt({ ctx: paraboles, idea });
  for (const s of ['Paraboles', 'Anime 2D', 'Pardon', 'Adultère', 'Le père', 'Patient et aimant', 'en français', '9:16',
    'accroche dans les 2 premières secondes', 'Louis Segond 1910', 'référence', 'Réponds uniquement avec un bloc ```json']) expect(p).toContain(s);
});
test('le prompt d’idées demande 5 idées et reprend l’indication', () => {
  const p = ideasStep.buildPrompt({ ctx: { ...paraboles, summary: '' }, hint: 'le fils prodigue' });
  expect(p).toContain('5 idées'); expect(p).toContain('le fils prodigue'); expect(p).toContain('Début du feuilleton');
});
```

(`paraboles` et `idea` sont des fixtures du fichier de test.)

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/ai`
Expected: FAIL.

- [ ] **Step 3: Implémenter**

`parseAiResponse` : prend le premier bloc ```json s'il existe, sinon le texte entre la première `{` et la dernière `}` ; essaie `JSON.parse`, puis une seconde fois après suppression des virgules avant `}` ou `]` ; valide avec zod. Message d'erreur de format : « La réponse ne respecte pas le format : {chemin} {problème}. Redemande à Claude en recollant le texte de départ. »

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/ai`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai && git commit -m "feat: prompts et lecture des réponses de Claude en mode manuel"
```

---

### Task 6: Prompt vidéo de chaque scène

**Files:**
- Create: `src/lib/video/scenePrompt.ts`, `src/lib/video/tools.ts`
- Test: `src/lib/video/scenePrompt.test.ts`

**Interfaces:**
- Consumes: `Account`, `Character`, `SceneDraft` (tâches 4 et 5)
- Produces: `buildScenePrompt(args: { account: Account; scene: SceneDraft; position: number; cast: Character[] }): { prompt: string; refs: Character[] }`
- Produces: `VIDEO_TOOLS = [{ name: 'Google Flow', url: 'https://labs.google/fx/tools/flow' }, { name: 'Dreamina', url: 'https://dreamina.capcut.com' }, { name: 'Kling', url: 'https://klingai.com' }]`

Règles (spec, section 11) : `refs` = personnages de la scène, triés par `position` dans la bible ; la phrase « Personnages joints : 1. {nom} ({description}), 2. … » suit le même ordre ; « La scène suit directement la précédente. » en tête quand `position > 1` ; style du compte, « plan vertical 9:16 », « {durationS} secondes » ; « Dialogue en français : {dialogue} » ou « Pas de dialogue. » ; aucun personnage absent de la scène n'est cité.

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('scène 3 : continuité, ordre de la bible, durée', () => {
  const { prompt, refs } = buildScenePrompt({ account: mer, position: 3, cast: [gaspard, bernard, perle],
    scene: { visual: 'Une vague emporte la pile.', dialogue: 'Gaspard : « Bernard ! »', durationS: 8, characters: ['Bernard', 'Gaspard'] } });
  expect(prompt.startsWith('La scène suit directement la précédente.')).toBe(true);
  expect(prompt).toContain('Personnages joints : 1. Gaspard (crabe rouge), 2. Bernard (petit bernard-l’ermite gris)');
  expect(prompt).toContain('Animation 3D'); expect(prompt).toContain('plan vertical 9:16'); expect(prompt).toContain('8 secondes');
  expect(prompt).not.toContain('Perle');
  expect(refs.map((c) => c.name)).toEqual(['Gaspard', 'Bernard']);
});
test('scène 1 sans dialogue', () => {
  const { prompt } = buildScenePrompt({ account: mer, position: 1, cast: [gaspard], scene: { visual: 'Plage.', dialogue: '', durationS: 6, characters: ['Gaspard'] } });
  expect(prompt.startsWith('La scène suit')).toBe(false);
  expect(prompt).toContain('Pas de dialogue.');
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/video/scenePrompt.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implémenter `buildScenePrompt` et `VIDEO_TOOLS`**

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/video/scenePrompt.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/video && git commit -m "feat: prompt vidéo par scène avec personnages constants"
```

---

### Task 7: Bible du compte

**Files:**
- Create: `src/app/comptes/page.tsx` (redirige vers le premier compte), `src/app/comptes/[id]/page.tsx`, `src/app/comptes/[id]/actions.ts`
- Create: `src/components/bible/ChipsField.tsx`, `src/components/bible/CharacterCard.tsx`, `src/components/bible/AutopilotCard.tsx`
- Create: `src/lib/validation/account.ts`
- Test: `src/lib/validation/account.test.ts`, `src/components/bible/ChipsField.test.tsx`, `src/components/bible/AutopilotCard.test.tsx`

**Interfaces:**
- Consumes: `requireUser`, `createServerSupabase` (tâche 3), `Account`, `Character` (tâche 4)
- Produces: `accountUpdateSchema` (zod), `characterSchema` (zod), `validateRefImage(file: { type: string; size: number }): { ok: true } | { ok: false; error: string }`
- Produces: `updateAccount(id: string, formData: FormData)`, `upsertCharacter(accountId: string, formData: FormData)`, `deleteCharacter(id: string)` (server actions, retour `{ ok: true } | { ok: false; error: string }`)
- Produces: `ChipsField({ name, label, values, max, tone })`, `AutopilotCard({ account, hasApiKeys })`

Règles : nom 1 à 40 caractères ; couleur `#RRGGBB` ; `targetDurationS` dans 20, 30, 40 ; 12 éléments max par liste de puces, sans doublon (comparaison sans casse ni espaces autour) ; image de référence PNG, JPEG ou WebP, 5 Mo max, stockée en `refs/{userId}/{characterId}.{ext}`. Mise en page : maquette « Bible du compte » (univers et style, personnages, valeurs, thèmes, exclusions, leçon finale, pilote automatique).

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('refuse une durée hors 20/30/40 et une couleur invalide', () => {
  const r = accountUpdateSchema.safeParse({ ...valid, targetDurationS: 25, color: 'violet' });
  expect(r.success).toBe(false);
});
test('image de référence', () => {
  expect(validateRefImage({ type: 'image/gif', size: 1000 })).toEqual({ ok: false, error: 'Image refusée : PNG, JPEG ou WebP uniquement.' });
  expect(validateRefImage({ type: 'image/png', size: 6 * 1024 * 1024 })).toEqual({ ok: false, error: 'Image trop lourde : 5 Mo maximum.' });
  expect(validateRefImage({ type: 'image/webp', size: 200_000 })).toEqual({ ok: true });
});
test('ChipsField ignore les doublons', async () => {
  render(<ChipsField name="values" label="Valeurs" values={['Pardon']} max={12} tone="accent" />);
  await userEvent.click(screen.getByRole('button', { name: '+ Ajouter' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Nouvelle valeur' }), '  pardon {enter}');
  expect(screen.getAllByText(/pardon/i)).toHaveLength(1);
});
test('AutopilotCard sans clés', () => {
  render(<AutopilotCard account={paraboles} hasApiKeys={false} />);
  expect(screen.getByText('Clés requises')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Toujours confirmer' })).toHaveAttribute('aria-pressed', 'true');
});
```

(Ajouter `@testing-library/user-event` en dépendance de dev.)

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/validation src/components/bible`
Expected: FAIL.

- [ ] **Step 3: Implémenter la validation, les composants, la page et les actions**

Les réglages du pilote automatique (rythme, « Toujours confirmer » ou « Sans confirmation », contrôle automatique) sont enregistrés dès la V1 même s'ils restent inactifs.

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/validation src/components/bible`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: bible du compte modifiable"
```

---

### Task 8: Accueil

**Files:**
- Create: `src/app/page.tsx`, `src/app/actions/startEpisode.ts`, `src/app/studio/page.tsx`
- Create: `src/components/home/HeroPrompt.tsx`, `src/components/home/ModeToggle.tsx`, `src/components/home/EpisodeGrid.tsx`, `src/components/home/EpisodeCard.tsx`
- Test: `src/components/home/home.test.tsx`, `src/app/actions/startEpisode.test.ts`

**Interfaces:**
- Consumes: `statusLabel`, `accountStats`, `verdict` (tâche 4), `AppShell` (tâche 1)
- Produces: `nextEpisodeNumber(existing: number[]): number`
- Produces: `startEpisode(input: { accountId: string; hint?: string }): Promise<{ ok: true; episodeId: string } | { ok: false; error: string }>` (crée l'épisode au statut `idee`, `idea = { hint }`, puis redirige vers `/episodes/{id}`)
- Produces: `episodeHref(e: { id: string; status: EpisodeStatus }): string` (`valide` et `publie` vers `/publier/{id}`, le reste vers `/episodes/{id}`)

Contenu (maquette « Accueil ») : titre « Bonjour {prénom} ! Quelle histoire on raconte aujourd'hui ? » (prénom = partie avant `@` de l'email si aucun prénom n'est enregistré), bascule « Pas à pas / Pilote auto », zone de saisie avec choix du compte, raccourcis (5 idées, Fable, Parabole, Saga familiale, Importer un lot vers `/import`), bandeau « Mode gratuit », grille « Tes épisodes » filtrable par compte (`?compte={id}`), et par compte : épisodes de la semaine, vues moyennes, verdict quand il existe. `/studio` redirige vers l'épisode non publié le plus récent, sinon vers `/`.

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('numérotation', () => { expect(nextEpisodeNumber([])).toBe(1); expect(nextEpisodeNumber([1, 2, 4])).toBe(5); });
test('liens des cartes', () => {
  expect(episodeHref({ id: 'e1', status: 'valide' })).toBe('/publier/e1');
  expect(episodeHref({ id: 'e2', status: 'scenes' })).toBe('/episodes/e2');
});
test('Pilote auto affiche l’avertissement', async () => {
  render(<ModeToggle />);
  await userEvent.click(screen.getByRole('button', { name: 'Pilote auto' }));
  expect(screen.getByRole('status')).toHaveTextContent('Le pilote automatique démarre dès que tes clés API sont connectées.');
});
test('filtre par compte', () => {
  render(<EpisodeGrid episodes={[epMer, epMarche]} accounts={accounts} filter={mer.id} />);
  expect(screen.getByText(epMer.title)).toBeInTheDocument();
  expect(screen.queryByText(epMarche.title)).toBeNull();
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/home src/app/actions`
Expected: FAIL.

- [ ] **Step 3: Implémenter la page, les composants et l'action**

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/components/home src/app/actions`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: accueil avec zone de création et grille d'épisodes"
```

---

### Task 9: Studio, étapes Idée et Script

**Files:**
- Create: `src/app/episodes/[id]/page.tsx`, `src/app/episodes/[id]/actions.ts`
- Create: `src/components/studio/Stepper.tsx`, `src/components/studio/CopyPasteStep.tsx`, `src/components/studio/IdeaPicker.tsx`
- Test: `src/components/studio/CopyPasteStep.test.tsx`, `src/app/episodes/[id]/actions.test.ts`

**Interfaces:**
- Consumes: `ideasStep`, `scriptStep`, `parseAiResponse` (tâche 5), `buildScenePrompt` (tâche 6), `import_script` (tâche 2), `transition` (tâche 4)
- Produces: `CopyPasteStep({ title, prompt, onSubmit }: { title: string; prompt: string; onSubmit(raw: string): Promise<{ ok: true } | { ok: false; error: string }> })`
- Produces: `chooseIdea(episodeId: string, idea: Idea): Promise<{ ok: true } | { ok: false; error: string }>`
- Produces: `importScript(episodeId: string, raw: string): Promise<{ ok: true } | { ok: false; error: string }>`
- Produces: `toImportPayload(draft: ScriptDraft, ctx: BibleContext): { ok: true; payload: ImportPayload } | { ok: false; error: string }`, avec `ImportPayload = { title; lesson; caption; hashtags; scenes: { position; start_s; duration_s; visual; dialogue; character_ids; prompt }[] }`

`CopyPasteStep` : bouton « Copier le texte pour Claude » (puis « Texte copié ✓ »), zone « Colle ici la réponse de Claude », bouton « Lire la réponse », erreur affichée en `role="alert"`. Étapes du `Stepper` : Idée, Script, Scènes, Montage, Validation (étape courante déduite du statut). Un nom de personnage inconnu donne l'erreur « Personnage inconnu : {nom}. Ajoute-le dans la bible ou corrige la réponse. »

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('toImportPayload calcule les débuts et les prompts', () => {
  const r = toImportPayload(draft4x8, ctxMer);
  expect(r.ok).toBe(true);
  if (r.ok) {
    expect(r.payload.scenes.map((s) => s.start_s)).toEqual([0, 8, 16, 24]);
    expect(r.payload.scenes[2].prompt.startsWith('La scène suit directement la précédente.')).toBe(true);
    expect(r.payload.scenes[0].character_ids).toEqual([gaspard.id]);
  }
});
test('personnage inconnu', () => {
  const bad = { ...draft4x8, scenes: draft4x8.scenes.map((s) => ({ ...s, characters: ['Médor'] })) };
  expect(toImportPayload(bad, ctxMer)).toEqual({ ok: false, error: 'Personnage inconnu : Médor. Ajoute-le dans la bible ou corrige la réponse.' });
});
test('réponse illisible : rien n’est envoyé à la base', async () => {
  const r = await importScript('ep1', 'blabla');
  expect(r.ok).toBe(false);
  expect(rpc).not.toHaveBeenCalled();
});
test('CopyPasteStep affiche l’erreur', async () => {
  render(<CopyPasteStep title="Script" prompt="p" onSubmit={async () => ({ ok: false, error: 'Format incorrect' })} />);
  await userEvent.type(screen.getByLabelText('Colle ici la réponse de Claude'), 'x');
  await userEvent.click(screen.getByRole('button', { name: 'Lire la réponse' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Format incorrect');
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/components/studio src/app/episodes`
Expected: FAIL.

- [ ] **Step 3: Implémenter**

`importScript` : `parseAiResponse(raw, scriptStep.schema)`, puis `toImportPayload`, puis `rpc('import_script', …)`. Aucune écriture si une étape échoue.

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/components/studio src/app/episodes`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: studio, étapes idée et script par copier-coller"
```

---

### Task 10: Studio, étape Scènes

**Files:**
- Create: `src/components/studio/SceneList.tsx`, `src/components/studio/ScenePanel.tsx`
- Create: `src/lib/video/clipFile.ts`
- Create: `src/app/episodes/[id]/scene-actions.ts`
- Test: `src/lib/video/clipFile.test.ts`, `src/app/episodes/[id]/scene-actions.test.ts`

**Interfaces:**
- Consumes: `transition` (tâche 4), `VIDEO_TOOLS` (tâche 6)
- Produces: `validateClipFile(file: { name: string; type: string; size: number }): { ok: true; ext: 'mp4' | 'webm' | 'mov' } | { ok: false; error: string }`
- Produces: `attachClip(sceneId: string, formData: FormData)`, `removeClip(sceneId: string)` (retour `{ ok: true; status: EpisodeStatus } | { ok: false; error: string }`)

Règles : formats `video/mp4`, `video/webm`, `video/quicktime` ; 200 Mo max ; chemin `clips/{userId}/{episodeId}/{sceneId}.{ext}` (écrase l'ancien) ; après chaque ajout ou retrait, statut recalculé avec `CLIPS_CHANGED`. Mise en page : maquette « Studio » (liste des scènes avec vignette et statut, panneau du prompt avec « Copier le prompt », images à joindre dans l'ordre, liens vers les outils vidéo, barre de progression « {n} clips sur {total} »).

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('formats de clip', () => {
  expect(validateClipFile({ name: 'a.avi', type: 'video/x-msvideo', size: 1e6 })).toEqual({ ok: false, error: 'Format refusé : MP4, WebM ou MOV uniquement.' });
  expect(validateClipFile({ name: 'a.mp4', type: 'video/mp4', size: 500 * 1024 * 1024 })).toEqual({ ok: false, error: 'Clip trop lourd : 200 Mo maximum.' });
  expect(validateClipFile({ name: 'a.MOV', type: 'video/quicktime', size: 3e7 })).toEqual({ ok: true, ext: 'mov' });
});
test('le dernier clip fait passer au montage', async () => {
  const r = await attachClip(lastMissingScene.id, formWithMp4);
  expect(r).toEqual({ ok: true, status: 'montage' });
});
test('retirer un clip en montage revient aux scènes', async () => {
  expect(await removeClip(sceneOfMontageEpisode.id)).toEqual({ ok: true, status: 'scenes' });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/video/clipFile.test.ts src/app/episodes`
Expected: FAIL.

- [ ] **Step 3: Implémenter**

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/video src/app/episodes`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: studio, prompts par scène et dépôt des clips"
```

---

### Task 11: Montage dans le navigateur et validation

**Files:**
- Create: `src/lib/montage/subtitles.ts`, `src/lib/montage/ffmpegArgs.ts`, `src/lib/montage/runMontage.ts`
- Create: `src/components/studio/MontageStep.tsx`, `src/components/studio/ValidationStep.tsx`
- Modify: `src/app/episodes/[id]/actions.ts` (ajout de `saveVideo`, `approveEpisode`, `redoScene`, `rejectEpisode`, `updateSummary`)
- Create: `public/fonts/Nunito-Bold.ttf` (licence OFL)
- Test: `src/lib/montage/subtitles.test.ts`, `src/lib/montage/ffmpegArgs.test.ts`, `src/components/studio/MontageStep.test.tsx`

**Interfaces:**
- Consumes: `transition` (tâche 4), `summaryStep` (tâche 5), `CopyPasteStep` (tâche 9)
- Produces: `buildAss(scenes: { startS: number; durationS: number; dialogue: string }[], lesson: string): string`
- Produces: `buildNormalizeArgs(input: string, output: string, hasAudio: boolean): string[]`
- Produces: `buildConcatArgs(listFile: string, assFile: string, fontsDir: string, output: string): string[]`
- Produces: `runMontage(clips: { name: string; data: Uint8Array }[], ass: string, onProgress?: (ratio: number) => void): Promise<Blob>`
- Produces: `saveVideo(episodeId: string, formData: FormData)`, `approveEpisode(episodeId: string)`, `redoScene(episodeId: string, sceneId: string)`, `rejectEpisode(episodeId: string)`, `updateSummary(accountId: string, raw: string)`

Valeurs : sortie 720x1280, 30 i/s, H.264 (`-preset veryfast`), AAC 44,1 kHz stéréo. Normalisation de chaque clip : `scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,fps=30` (une vidéo horizontale est recadrée au centre) ; piste muette `anullsrc` ajoutée quand le clip n'a pas d'audio (détection en lisant le journal d'ffmpeg). Sous-titres ASS : police Nunito, taille 46, en bas ; leçon affichée pendant les 3 dernières secondes, style « Lecon », taille 58, centrée. Échappement du texte : `{` devient `(`, `}` devient `)`, les retours à la ligne deviennent `\N`. Vidéo stockée en `videos/{userId}/{episodeId}.mp4`. `approveEpisode` renseigne `validated_at`, puis l'écran propose « Mettre à jour le résumé du feuilleton » (CopyPasteStep avec `summaryStep`) qui écrit `accounts.series_summary`. `redoScene` efface le clip de la scène et la vidéo, statut `REDO_SCENE`.

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('temps et échappement des sous-titres', () => {
  const ass = buildAss([{ startS: 0, durationS: 8, dialogue: 'Gaspard : « {Tout} ça, c’est à moi ! »\nBernard : « Oh. »' }], 'Celui qui partage ne perd jamais rien.');
  expect(ass).toContain('Dialogue: 0,0:00:00.00,0:00:08.00,Default,,0,0,0,,Gaspard : « (Tout) ça, c’est à moi ! »\\NBernard : « Oh. »');
  expect(ass).toContain('Dialogue: 0,0:00:05.00,0:00:08.00,Lecon,,0,0,0,,Celui qui partage ne perd jamais rien.');
});
test('normalisation d’un clip sans audio', () => {
  const args = buildNormalizeArgs('s1.mov', 'n1.mp4', false);
  expect(args).toContain('anullsrc=channel_layout=stereo:sample_rate=44100');
  expect(args.join(' ')).toContain('scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280');
  expect(args).toContain('-shortest');
});
test('assemblage avec sous-titres', () => {
  const args = buildConcatArgs('list.txt', 'subs.ass', '/fonts', 'episode.mp4');
  expect(args.slice(0, 6)).toEqual(['-f', 'concat', '-safe', '0', '-i', 'list.txt']);
  expect(args).toContain('subtitles=subs.ass:fontsdir=/fonts');
  expect(args.at(-1)).toBe('episode.mp4');
});
test('montage en échec : message et rien d’enregistré', async () => {
  const save = vi.fn();
  render(<MontageStep episode={ep} scenes={scenes} run={() => Promise.reject(new Error('OOM'))} onSave={save} />);
  await userEvent.click(screen.getByRole('button', { name: 'Lancer le montage' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Le montage a échoué. Réessaie depuis un ordinateur.');
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Lancer le montage' })).toBeEnabled();
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/montage src/components/studio/MontageStep.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implémenter**

`runMontage` charge ffmpeg.wasm une seule fois (import dynamique), écrit la police et les clips dans son système de fichiers, normalise chaque clip, écrit `list.txt` et `subs.ass`, assemble, renvoie un `Blob` `video/mp4`. `MontageStep` reçoit `run` et `onSave` en props (injection) pour être testable, affiche la progression et un aperçu vidéo à la fin.

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/montage src/components/studio`
Expected: PASS.

- [ ] **Step 5: Vérification manuelle**

Run: `npm run dev`, monter un épisode de 4 clips réels (dont un horizontal et un sans son) depuis Chrome sur PC.
Expected: MP4 720x1280 d'environ 32 s, sous-titres lisibles, leçon visible à la fin, statut « À valider ».

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: montage dans le navigateur, sous-titres et validation"
```

---

### Task 12: Publication sur téléphone et suivi des vues

**Files:**
- Create: `src/app/publier/page.tsx`, `src/app/publier/[id]/page.tsx`, `src/app/publier/actions.ts`
- Create: `src/components/publish/PublishPanel.tsx`
- Create: `src/lib/validation/views.ts`
- Test: `src/lib/validation/views.test.ts`, `src/components/publish/PublishPanel.test.tsx`

**Interfaces:**
- Consumes: `transition` (tâche 4)
- Produces: `parseViews(input: string): { ok: true; value: number } | { ok: false; error: string }`
- Produces: `shareText(caption: string, hashtags: string[]): string` (légende, ligne vide, hashtags séparés par des espaces)
- Produces: `markPublished(episodeId: string)` (statut `PUBLISHED`, `published_at`), `saveViews(episodeId: string, input: string)` (`views`, `views_updated_at`)

`/publier` liste les épisodes `valide` puis les `publie` sans vues. Lien de téléchargement signé valable 1 heure. Mise en page : maquette « Publication sur téléphone ». Le bouton « Marquer comme publié » reste désactivé tant que la case « J'ai activé le label « Contenu généré par IA » » n'est pas cochée. Après publication : « Publié. Reviens dans 24 h pour noter les vues de cet épisode. »

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('saisie des vues', () => {
  expect(parseViews('12 500')).toEqual({ ok: true, value: 12500 });
  expect(parseViews('12.500')).toEqual({ ok: true, value: 12500 });
  expect(parseViews('0')).toEqual({ ok: true, value: 0 });
  expect(parseViews('-3')).toEqual({ ok: false, error: 'Indique un nombre de vues (chiffres uniquement).' });
  expect(parseViews('')).toEqual({ ok: false, error: 'Indique un nombre de vues (chiffres uniquement).' });
});
test('texte à copier', () => {
  expect(shareText('Mamie Mangue ne peut plus payer son loyer.', ['#histoire', '#famille'])).toBe('Mamie Mangue ne peut plus payer son loyer.\n\n#histoire #famille');
});
test('publication bloquée sans label IA', async () => {
  render(<PublishPanel episode={valide} videoUrl="https://x" onPublish={vi.fn()} />);
  const btn = screen.getByRole('button', { name: 'Marquer comme publié' });
  expect(btn).toBeDisabled();
  await userEvent.click(screen.getByRole('checkbox', { name: /label « Contenu généré par IA »/ }));
  expect(btn).toBeEnabled();
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/validation/views.test.ts src/components/publish`
Expected: FAIL.

- [ ] **Step 3: Implémenter**

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/lib/validation src/components/publish`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: publication depuis le téléphone et saisie des vues"
```

---

### Task 13: Import d'une semaine d'épisodes

**Files:**
- Create: `src/app/import/page.tsx`, `src/app/import/actions.ts`
- Test: `src/app/import/actions.test.ts`

**Interfaces:**
- Consumes: `batchStep`, `parseAiResponse` (tâche 5), `toImportPayload` (tâche 9), `import_batch` (tâche 2), `CopyPasteStep` (tâche 9)
- Produces: `importBatch(accountId: string, raw: string): Promise<{ ok: true; created: number } | { ok: false; error: string }>`

Page : choix du compte, nombre d'épisodes (1 à 9, 3 par défaut), `CopyPasteStep` avec `batchStep`. Tout ou rien : si un épisode du lot est invalide, rien n'est créé et l'erreur indique son numéro (« Épisode 2 du lot : … »).

- [ ] **Step 1: Écrire les tests qui échouent**

```ts
test('import de 3 épisodes', async () => {
  expect(await importBatch(mer.id, batchOf3)).toEqual({ ok: true, created: 3 });
  expect(rpc).toHaveBeenCalledWith('import_batch', expect.objectContaining({ p_account_id: mer.id }));
});
test('un épisode invalide bloque tout le lot', async () => {
  const r = await importBatch(mer.id, batchWithBadSecond);
  expect(r).toEqual({ ok: false, error: expect.stringMatching(/^Épisode 2 du lot : /) });
  expect(rpc).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npx vitest run src/app/import`
Expected: FAIL.

- [ ] **Step 3: Implémenter**

- [ ] **Step 4: Vérifier le succès**

Run: `npx vitest run src/app/import`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: import d'un lot d'épisodes"
```

---

### Task 14: Page Clés API, mise en ligne et vérification complète

**Files:**
- Create: `src/app/cles-api/page.tsx`
- Create: `README.md`, `docs/verification-v1.md`
- Test: `src/app/cles-api/page.test.tsx`

**Interfaces:**
- Consumes: tout ce qui précède

`/cles-api` : texte « Le pilote automatique arrive avec la prochaine version. Il te faudra une clé API Anthropic et une clé pour le modèle vidéo. En attendant, tout fonctionne gratuitement en mode Pas à pas. », sans champ de saisie.

- [ ] **Step 1: Écrire le test qui échoue**

```tsx
test('aucun champ de clé en V1', () => {
  render(<ClesApiPage />);
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByText(/mode Pas à pas/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Vérifier l'échec, implémenter, vérifier le succès**

Run: `npx vitest run src/app/cles-api`
Expected: FAIL, puis PASS après implémentation.

- [ ] **Step 3: Lancer toute la suite**

Run: `npm test && supabase test db && npm run build`
Expected: tout passe.

- [ ] **Step 4: Mettre en ligne**

Créer le projet Supabase (offre gratuite), `supabase link` puis `supabase db push`, ajouter l'URL Vercel dans les adresses de redirection de l'authentification Supabase, déployer sur Vercel avec les 3 variables de `.env.example`.

- [ ] **Step 5: Vérification de bout en bout (`docs/verification-v1.md`)**

Sur l'URL de production : connexion par lien ; les 3 comptes existent ; modifier une bible et ajouter un personnage avec image ; créer un épisode, coller de vraies réponses de Claude (idées puis script) ; déposer 4 vrais clips générés gratuitement ; monter sur PC ; valider ; mettre à jour le résumé ; ouvrir `/publier` sur téléphone, télécharger, copier la légende, cocher le label, marquer publié ; saisir des vues. Puis se connecter avec une seconde adresse email et vérifier qu'aucune donnée du premier compte n'apparaît, y compris en ouvrant directement l'URL d'un de ses épisodes.
Expected: chaque point coché dans `docs/verification-v1.md`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: page Clés API, mise en ligne et vérification V1"
```
