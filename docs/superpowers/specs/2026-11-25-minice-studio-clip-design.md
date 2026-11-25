# Minice Studio Clip : document de conception (v3)

Date : 25 novembre 2026. Statut : à valider par Arthur.

Changements depuis la v2 : nom définitif, pilote automatique, validation optionnelle, base prête pour plusieurs utilisateurs, design validé (marque Minice et mise en page inspirée de Meshy).

Maquettes validées : https://claude.ai/artifact/CC6wrK31R5VzdLQDAb2WfL

## 1. Intention

Minice Studio Clip sert à produire des mini-séries dramatiques générées par IA pour TikTok, dans le but d'**informer et transmettre** : des leçons de vie, des valeurs et la foi chrétienne. Le drame sert d'accroche, la leçon arrive à la fin. Arthur est chrétien : les vidéos doivent rester fidèles à ses valeurs.

Arthur va créer 3 nouveaux comptes TikTok, chacun avec son univers. L'appli propose des idées, prépare les scripts et les prompts vidéo, assemble les épisodes et prépare la publication. Plus tard, elle pourra tout faire seule grâce au pilote automatique.

Le but du test : savoir en 4 semaines si ce contenu prend, avant d'investir de l'argent. Arthur n'a pas encore de budget : la V1 doit fonctionner sans aucun service payant.

C'est un produit de type SaaS, avec une UX soignée. Arthur est le seul utilisateur pendant le test, mais l'appli est construite pour accueillir d'autres utilisateurs plus tard.

## 2. Objectifs

- Produire un épisode en quelques étapes simples, sans payer d'API.
- 3 épisodes par semaine et par compte (9 par semaine), à ajuster selon les crédits gratuits disponibles.
- Tout le contenu éditorial est modifiable dans l'appli : comptes, styles, personnages, thématiques, règles.
- Un pilote automatique par compte, prêt à fonctionner dès que les clés API sont branchées.
- Une validation réglable : « Toujours confirmer » ou « Sans confirmation ».
- Suivre les vues par épisode et par compte pour rendre un verdict au bout de 4 semaines.
- Une base de données et une sécurité pensées pour plusieurs utilisateurs dès le départ.

## 3. Hors périmètre (V1)

- Ouverture de l'appli à d'autres utilisateurs, abonnements et paiement.
- Publication automatique sur TikTok. Arthur publie à la main depuis son téléphone.
- Monétisation et épisodes de 1 minute ou plus.
- Récupération automatique des statistiques TikTok.
- Autres langues que le français.

## 4. Ce qui ferait échouer le projet, même si l'appli marche

- Du contenu contraire aux valeurs d'Arthur ou irrespectueux envers la foi chrétienne.
- Une leçon assénée si lourdement que les gens décrochent avant la fin.
- Faire bannir un compte : contenu gore ou sexuel, humains réalistes, vraies personnes, personnages protégés par le droit d'auteur, absence de label IA.
- Publier le même contenu sur plusieurs comptes. TikTok le traite comme du contenu non original.
- Des données ou des clés API d'un utilisateur visibles par un autre.
- Passer tellement de temps à construire que le premier épisode n'arrive jamais.
- Utiliser l'ancien compte de 30k abonnés pour le test.

## 5. Ligne éditoriale

**Recette** : un drame qui accroche dans les 2 premières secondes, puis une leçon à la fin de l'histoire. Une histoire dure 1 à 3 épisodes : les premiers finissent sur un suspense, le dernier sur la leçon.

**Valeurs mises en avant** : humilité, honnêteté, pardon, famille, persévérance, foi.

**Exclus** : adultère, vengeance cruelle, grossesses cachées, violence gore, scènes sexuelles. La « revanche » est permise quand elle prend la forme d'une justice réparée ou d'une réussite méritée, pas d'une humiliation.

**La leçon** : une phrase courte à la fin, dite par un personnage ou affichée à l'écran. Pour le contenu chrétien, elle peut citer un verset. Les citations bibliques utilisent une traduction du domaine public (Louis Segond 1910), avec la référence.

**Repères tirés de ce qui marche en novembre 2026** (pour guider les idées, pas pour copier) :
- Les sagas familiales et les histoires « de la misère à la richesse » ont remplacé les histoires de couple.
- Les étiquettes de prix sur le front des personnages rendent la situation lisible en une seconde.
- Les objets du quotidien marchent aussi comme personnages.

## 6. Les 3 comptes (point de départ, modifiable dans l'appli)

| Compte | Style | Personnages | Contenu |
|---|---|---|---|
| Fables de la Mer | Animation 3D | Animaux marins | Fables modernes : leçons de vie et valeurs |
| Paraboles | Anime 2D | Humains | Paraboles et récits bibliques mis en scène |
| Le Marché | Réaliste | Fruits, légumes, objets du quotidien | Sagas familiales et réussites méritées, avec une morale |

Règles communes : tout en français, format vertical 9:16, épisodes de 20 à 40 secondes (cible 30 secondes), feuilleton avec des personnages récurrents. Sur Paraboles, les personnages humains sont adultes et traités avec respect.

## 7. Contraintes

- **Coût** : 0 € en V1. La vidéo vient d'outils gratuits (par exemple Google Flow, environ 5 clips de 8 secondes par jour en Veo 3.1 Lite, ou Dreamina). Les offres gratuites changent souvent : à revérifier au lancement.
- **Filigranes** : certains outils gratuits en ajoutent un. À vérifier avant de choisir l'outil.
- **Durée des plans** : environ 8 secondes maximum par génération. Un épisode compte 3 à 5 scènes.
- **Label IA** : chaque épisode publié porte le label « contenu généré par IA » de TikTok.
- **Accès** : l'appli s'utilise depuis le PC (production) et depuis le téléphone (téléchargement et publication).
- **Pilote automatique** : il a besoin des API payantes (Claude et un modèle vidéo), car l'appli doit tout appeler seule. En mode gratuit, il reste visible mais inactif.

## 8. Approches envisagées

1. **Appli web** : idées, scripts, prompts, montage et file de validation dans une seule appli. **Choisie par Arthur**, en commençant par le mode gratuit.
2. **Sans appli** : tout à la main dans la conversation et des outils existants. Écartée : trop de copier-coller à 9 épisodes par semaine.
3. **Appli en version « BD animée »** : surtout des images fixes avec des voix. Écartée : ça ressemble à un diaporama, un format souvent signalé comme non original.

## 9. Design (validé par Arthur)

- **Marque Minice** : la mascotte comme icône d'appli, bleu nuit #0F1A2C, lavande #8C86F8 pour les actions principales (texte bleu nuit dessus pour la lisibilité), polices arrondies Quicksand (titres) et Nunito (texte).
- **Mise en page inspirée de Meshy** : thème sombre avec un léger halo coloré, barre d'icônes à gauche avec libellés, grande zone de saisie au centre de l'accueil, raccourcis sous la zone de saisie, grille de cartes d'épisodes.
- **Une couleur par compte** : sarcelle pour Fables de la Mer, ambre pour Paraboles, rose pour Le Marché.
- **Écrans maquettés** : Accueil, Bible du compte, Studio d'épisode, Publication sur téléphone. L'écran Clés API et l'écran de connexion seront dessinés pendant la construction, dans le même style.
- **Accessibilité** : contrastes suffisants, vrais boutons et liens, zones cliquables d'au moins 44 px.

## 10. Le parcours d'Arthur

**Mode « Pas à pas » (gratuit, V1)**

1. **Bible du compte** : style visuel, ton, valeurs, thématiques, règles, personnages (nom, description, image de référence). Tout est modifiable à tout moment.
2. **Idées** : depuis l'accueil, Arthur choisit un compte et décrit une idée, ou demande 5 propositions. L'appli prépare un texte prêt à coller dans Claude (abonnement d'Arthur), avec la bible du compte et le résumé du feuilleton. Arthur recolle la réponse, l'appli en tire les idées. Il en garde une.
3. **Script** : même principe. Claude rend l'épisode découpé en scènes, dans un format que l'appli sait lire : ce qu'on voit, les personnages, les dialogues, la durée, la leçon finale.
4. **Import en lot** : Arthur peut demander à Claude une semaine d'épisodes d'un coup et importer le fichier.
5. **Prompts vidéo** : pour chaque scène, l'appli prépare un prompt à copier, avec les images de référence à joindre dans l'ordre.
6. **Clips** : Arthur génère chaque scène dans l'outil gratuit et dépose le clip dans l'appli. Une scène ratée se refait seule.
7. **Montage** : l'appli assemble les clips, ajoute les sous-titres et la leçon finale, et produit un MP4 vertical.
8. **Validation** : Arthur regarde l'épisode, puis le valide, refait une scène ou le rejette.
9. **Publication** : sur le téléphone, Arthur télécharge la vidéo, copie la légende et les hashtags, publie avec le label IA, puis marque l'épisode comme publié.
10. **Suivi** : Arthur note les vues de chaque épisode. L'accueil montre l'état de chaque épisode et, par compte, les vues moyennes et le meilleur épisode.
11. **Verdict à 4 semaines** : un compte « prend » si ses épisodes dépassent régulièrement 10 000 vues (seuil proposé, à ajuster).

**Mode « Pilote auto » (quand les clés API sont branchées)**

- Réglages par compte : rythme (par exemple 3 épisodes par semaine) et validation (« Toujours confirmer » ou « Sans confirmation »).
- L'appli enchaîne seule les étapes 2 à 7.
- **Contrôle automatique** : avant de marquer un épisode « prêt », une IA le relit et le compare aux règles et aux valeurs du compte. Activé par défaut, désactivable. Un épisode qui échoue au contrôle va dans la file de validation, même en « Sans confirmation ».
- La publication reste manuelle en V1 : Arthur voit donc chaque vidéo avant qu'elle sorte.

## 11. Garder les personnages identiques

- Une image de référence en pied par personnage, sur fond gris uni, avec une couleur dominante différente pour chaque personnage principal.
- Les mêmes images jointes dans le même ordre à chaque scène, et nommées dans le prompt.
- Une image du décor pour garder le même lieu.
- Chaque prompt commence par rappeler que la scène suit la précédente et où se trouve chaque personnage.

## 12. Choix techniques

Décidés par Claude, Arthur peut les contester.

- **Langage et interface** : TypeScript, Next.js.
- **Données et fichiers** : Supabase (offre gratuite) pour la base de données, l'authentification et le stockage.
- **Plusieurs utilisateurs dès le départ** : chaque donnée appartient à un utilisateur, et les règles de sécurité de la base (Row Level Security) empêchent tout accès aux données d'un autre.
- **Connexion** : sans mot de passe, par lien envoyé par email, comme sur Minice.
- **Clés API** : chiffrées côté serveur, jamais envoyées au navigateur, jamais affichées en clair après enregistrement.
- **Montage** : dans le navigateur avec ffmpeg.wasm en V1, pour ne pas payer de serveur.
- **IA** : chaque étape IA passe par une interface commune avec deux modes, « manuel » (copier-coller, V1) et « automatique » (API Anthropic et API vidéo). Le pilote automatique utilise le mode automatique avec des tâches planifiées côté serveur.
- **Construction** : avec Claude Code. Claude Opus 5.5 pour l'essentiel ; Claude Fable 5.2 (inclus dans le forfait Max d'Arthur, dans la limite de 50 % de l'usage hebdomadaire) pour l'architecture multi-utilisateurs, la sécurité et les bugs difficiles.

## 13. Risques à vérifier en premier

- **Dialogues en français** : vérifier que l'outil vidéo gratuit produit des voix françaises correctes. Plan B : clips sans dialogue, voix off ajoutée au montage, sous-titres.
- **Personnages identiques** : vérifier que l'outil accepte des images de référence.
- **Crédits gratuits** : vérifier qu'ils suffisent pour 9 épisodes par semaine. Sinon, passer à 2 épisodes par semaine et par compte.
- **Filigrane** : vérifier ce que chaque outil gratuit ajoute à l'image.
- **Modèle vidéo du mode automatique** : choisi après le test. Candidats au 25 novembre 2026 : MiniMax H3 (meilleur rapport qualité/prix), HeyGen Video 1 (le moins cher du haut du classement), Veo 3.1 Lite.

Ces points se testent avec une seule scène par compte, avant de construire le reste. Le test se fait d'abord avec les crédits gratuits (Dreamina avec Seedance 2.0, Google Flow, Kling). Les 5 € d'Arthur servent seulement si une comparaison payante est utile.

## 14. Laissé au builder

- L'hébergement exact, avec un coût de 0 € pendant le test.
- Le format exact des réponses de Claude que l'appli lit (texte structuré ou JSON), tant que le copier-coller reste simple.
- Le mécanisme exact des tâches planifiées du pilote automatique.
- Le détail des écrans non maquettés, dans le style validé.

## 15. Ce dont Arthur aura besoin

- Un projet Supabase (offre gratuite).
- Un compte Google pour Google Flow, et éventuellement un compte Dreamina.
- Les 3 comptes TikTok créés en comptes personnels, pour garder la monétisation possible plus tard.
- Plus tard, pour le pilote automatique : une clé API Anthropic et une clé pour le modèle vidéo.
