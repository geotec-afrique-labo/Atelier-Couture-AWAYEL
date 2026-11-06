# Atelier Couture — Guide d'installation et de prise en main

Atelier Couture est une application de dessin de mode pour tablette. Elle fonctionne aussi au crayon (Apple Pencil, stylet Android) et au doigt.

Elle propose :
- des silhouettes de croquis (femme 9 têtes, homme, enfant ; vues face, dos et profil) ;
- des calques ;
- des pinceaux sensibles à la pression ;
- une symétrie ;
- des tissus : wax, bazin, soie, dentelle, satin, mousseline… ;
- une bibliothèque de **modules** : 62 éléments de vêtement, 7 encolures et 10 ensembles de départ ;
- un **assistant** : proportions, cohérence des modules, tombé des tissus, lexique de la couture et variantes générées ;
- l'export en **PNG** ou en **PDF**, avec une fiche technique (croquis, métrage de tissu, fournitures, notes).

---

## 1. Pourquoi une application « PWA » et pas Apps Script

Une PWA est une page web qui s'installe comme une vraie application.
- **Avantages :**
  - Elle s'ouvre en plein écran, sans barre d'adresse.
  - Elle marche **sans Internet** une fois installée.
  - Les dessins sont enregistrés **dans la tablette**.
- **Limites d'Apps Script pour du dessin :**
  - Apps Script affiche la page dans plusieurs cadres Google imbriqués. Le trait est donc moins fluide.
  - Il faut une connexion permanente.
  - Les téléchargements de PNG et de PDF y sont peu fiables.

Pour du dessin au crayon, la PWA est le meilleur choix.

---

## 2. Essayer sur le PC (facultatif)

1. Ouvrir PowerShell dans le dossier `Atelier Couture`.
2. Taper :
   ```
   node outils\serveur_local.js
   ```
3. Ouvrir **http://localhost:8772** dans Chrome ou Edge.

On peut dessiner à la souris. Pour arrêter, fermer la fenêtre PowerShell.

> Sur le PC, le mode « hors ligne » est volontairement désactivé, pour toujours voir la dernière version des fichiers.

---

## 3. Mettre l'application en ligne (une seule fois)

La tablette a besoin d'une adresse **https**. Le plus simple est **Netlify Drop**, qui est gratuit :

1. Aller sur **https://app.netlify.com/drop**.
2. Créer un compte gratuit, ou se connecter avec Google.
3. **Glisser le dossier `Atelier Couture` entier** dans la zone indiquée.
4. Netlify donne une adresse du type `https://nom-au-hasard.netlify.app`.
   - Dans **Site settings → Change site name**, on peut la renommer, par exemple `atelier-couture-sally`.
5. Noter cette adresse.

*Autre possibilité : GitHub Pages, comme pour le lanceur des tablettes du labo. On dépose les fichiers dans un dépôt, puis Settings → Pages.*

**Pour mettre à jour l'application plus tard :**
1. Dans Netlify, ouvrir le site, puis **Deploys**.
2. Glisser à nouveau le dossier.

L'adresse ne change pas.

---

## 4. Installer sur la tablette

### iPad (Safari obligatoire)
1. Ouvrir l'adresse https dans **Safari**.
2. Toucher le bouton **Partager** (carré avec une flèche vers le haut).
3. Toucher **« Sur l'écran d'accueil »**, puis **Ajouter**.
4. Lancer **Atelier Couture** depuis l'icône dorée « AC ».

### Tablette Android (Chrome)
1. Ouvrir l'adresse dans **Chrome**.
2. Ouvrir le menu **⋮**, puis **Installer l'application** (ou « Ajouter à l'écran d'accueil »).
3. Lancer depuis l'icône.

La première ouverture doit se faire **avec Internet**. Ensuite, l'application fonctionne hors ligne.

---

## 5. Premiers pas

1. **Menu ☰ (Mes croquis) → Nouveau** : choisir la silhouette (femme, homme ou enfant) et la vue (face, dos ou profil).
2. Panneau de droite, onglet **Modules** :
   - Toucher un **ensemble** (boubou, taille basse, sirène, ndokette…) ou ajouter des pièces une à une : corsage, jupe, manches, cols, ornements.
   - Toucher une pièce sur le dessin pour la **sélectionner**. On peut alors la déplacer, la tourner, l'agrandir, changer son tissu ou sa couleur, ou la mettre en miroir.
3. Barre d'outils à gauche :
   - Choisir un pinceau : crayon, encre, feutre, aquarelle, gouache, tissu, gomme, pot de peinture ou pipette.
   - Le crayon réagit à la **pression**.
4. Onglet **Atelier** :
   - **Conseils** : cohérence de la tenue (par exemple un col Claudine sur un décolleté en V).
   - **Variantes** : propositions de forme ou de couleur, applicables d'un toucher.
   - **Proportions**, **Tissus** (tombé et conseils) et **Lexique**.
5. Onglet **Fiche** : nom du modèle, client, notes. Le métrage est calculé automatiquement.
6. Bouton **Exporter** : PNG du croquis, ou PDF avec la fiche technique.

### Gestes
| Geste | Effet |
|---|---|
| Crayon | dessine |
| Un doigt (si un crayon a déjà été utilisé) | déplace la feuille |
| Deux doigts écartés ou pincés | zoom |
| Toucher à deux doigts | annuler |
| Toucher à trois doigts | rétablir |

Quand un crayon est détecté, le doigt ne dessine plus : la main peut donc se poser sur l'écran. Ce réglage se change dans **☰ (Mes croquis) → Réglages**, en bas de la fenêtre.

---

## 6. Sauvegardes — important

- Le projet s'enregistre **automatiquement dans la tablette**, environ 2 secondes après chaque trait.
- **Attention :** si on supprime l'application, ou si on vide les données de Safari ou de Chrome, **les dessins sont perdus**.
- **Conseil :** faire régulièrement **Exporter → Sauvegarde .atelier**. Ce fichier se rouvre ensuite avec **☰ (Mes croquis) → Importer un fichier .atelier**. On peut le ranger dans Fichiers, Google Drive ou WhatsApp.

## 7. Mises à jour

Après une nouvelle mise en ligne, **fermer puis rouvrir l'application deux fois**. La première ouverture télécharge la nouvelle version ; la seconde l'affiche.

---

## 8. Ce qui a été vérifié — et ce qui ne l'a pas été

**Vérifié sur PC, dans un navigateur, avec un crayon simulé, en 1024×768 (paysage) et 768×1024 (portrait) :**
- Le trait :
  - la pression amincit les fins de trait ;
  - chaque point de crayon est traité en environ 0,1 ms ;
  - le dessin d'un trait coûte environ 0,1 ms par image côté processeur.
- Les gestes : zoom à deux doigts, annuler à deux doigts, rétablir à trois doigts.
- Les outils : symétrie, gomme, pot de peinture, annulation exacte.
- Les modules :
  - les 62 modules se dessinent sur les 9 combinaisons silhouette × vue ;
  - sélection, déplacement et changement d'encolure fonctionnent ;
  - les conseils, la nomenclature et les variantes s'affichent.
- La sauvegarde automatique, et la réouverture du projet après rechargement.
- Le PDF : 2 pages, bien lu par Chrome.

**PAS vérifié (aucune vraie tablette n'était disponible) :**
- La pression réelle de l'Apple Pencil ou d'un stylet Android, et la latence ressentie.
- Le comportement quand la paume est posée sur l'écran.
- Safari sur iPad :
  - le téléchargement des PNG et PDF (sur iPad, une feuille « Partager » peut s'ouvrir à la place) ;
  - la conservation des données.
- L'installation sur l'écran d'accueil et le fonctionnement hors ligne en https.
- La mémoire sur un ancien iPad avec beaucoup de calques. Il y a une limite de 80 annulations.

**Limites connues :**
- Les modules sont dessinés **de face**. En vue dos ou profil, ils servent de base à retoucher à la main.
- Le pot de peinture sur une très grande zone peut prendre une demi-seconde sur tablette.

À la première utilisation sur la tablette, faire un petit essai :
1. Quelques traits au crayon.
2. Un export PNG, puis un export PDF.
3. Fermer, puis rouvrir l'application.

Si quelque chose ne va pas, noter ce qui se passe pour qu'on puisse corriger.
