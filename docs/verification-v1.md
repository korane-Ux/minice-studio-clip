# Vérification de bout en bout de la V1

À dérouler sur l'adresse de production, après la mise en ligne (voir README).

## Sur ordinateur (Chrome)

- [ ] Connexion : saisir son email, recevoir le lien, l'ouvrir, arriver sur l'accueil.
- [ ] Demander le lien sur l'ordinateur et l'ouvrir sur le téléphone : la connexion marche aussi.
- [ ] Saisir une adresse absente de `ALLOWED_EMAILS` : « Cette adresse n'a pas accès à Minice Studio Clip. », aucun email envoyé.
- [ ] Les 3 comptes existent : Fables de la Mer, Paraboles, Le Marché.
- [ ] Bible : modifier le ton d'un compte, ajouter une valeur, enregistrer, recharger : la modification est là.
- [ ] Personnage : ajouter un personnage avec une image de référence (PNG de moins de 5 Mo), l'image s'affiche.
- [ ] Accueil : choisir un compte, laisser l'idée vide, lancer : l'épisode s'ouvre à l'étape Idée.
- [ ] Idées : copier le texte, le coller dans Claude, recoller la réponse : 5 idées s'affichent, en choisir une.
- [ ] Script : copier le texte, le coller dans Claude, recoller la réponse : les scènes apparaissent avec leurs prompts.
- [ ] Coller volontairement une réponse coupée : un message d'erreur clair s'affiche, rien n'est enregistré.
- [ ] Scènes : pour chaque scène, copier le prompt, générer le clip dans un outil gratuit, le déposer. Le compteur avance, le statut passe à « Prêt pour le montage ».
- [ ] Déposer un fichier `.avi` : refusé avec un message.
- [ ] Déposer un clip de plus de 50 Mo : refusé avec un message.
- [ ] Montage : lancer, attendre la fin. La vidéo est verticale, dure exactement la somme des durées des scènes, les sous-titres tombent avec les bonnes scènes et la leçon finale est visible.
- [ ] Au montage, remplacer un clip par un fichier corrompu (un `.mp4` renommé) : le message nomme la scène ; le remplacer par un bon clip et relancer : le montage réussit.
- [ ] Validation : « Refaire une scène » demande confirmation, puis renvoie à l'étape des scènes ; redéposer le clip, remonter, puis valider.
- [ ] Sur un autre épisode, « Abandonner l'épisode » demande confirmation, puis l'épisode passe en « Rejeté ».
- [ ] Résumé : copier le texte, le coller dans Claude, recoller la réponse : « Résumé du feuilleton mis à jour ».

## Sur téléphone

- [ ] Ouvrir `/publier` : l'épisode validé apparaît.
- [ ] Télécharger la vidéo, copier la légende et les hashtags.
- [ ] « Marquer comme publié » reste grisé tant que la case du label IA n'est pas cochée.
- [ ] Après publication : saisir un nombre de vues, il s'affiche sur la carte de l'accueil.
- [ ] Dans Supabase (*Storage > clips*), le dossier de l'épisode publié est vide.

## Sécurité

- [ ] Ajouter temporairement une seconde adresse dans `ALLOWED_EMAILS`, s'y connecter : aucun compte, épisode ou fichier du premier utilisateur n'apparaît.
- [ ] Avec ce second compte, ouvrir directement l'adresse d'un épisode du premier : page introuvable.
- [ ] Après la première connexion, l'option *Allow new users to sign up* est désactivée dans Supabase.
