Pour cette V1, les fonctionnalités attendues sur l'application mobile se concentrent sur la collecte de données hétérogènes, leur transformation en texte pur, et la restitution du meme généré.
Voici la liste exhaustive des besoins fonctionnels du frontend, classés par modules :
------------------------------
## 1. Gestion et Collecte du Contexte (Le "Fil de Discussion")
Le cœur de l'application consiste à simuler ou composer le contexte de la discussion WhatsApp.

* Saisie de texte manuel : Permettre à l'utilisateur d'ajouter des répliques textuelles à la volée.
* Import d'images : Permettre de sélectionner une ou plusieurs images depuis la galerie du téléphone ou via l'appareil photo.
* Import / Enregistrement Audio :
* Permettre d'enregistrer un mémo vocal directement depuis l'application.
   * Permettre d'importer un fichier audio existant depuis le stockage du téléphone.
* Chronologie du contexte : Visualiser, réordonner ou supprimer les éléments ajoutés (textes, images, audios) avant l'envoi pour s'assurer que le fil de discussion est logique.

------------------------------
## 2. Traitement des Données Locales (On-Device)
Avant d'envoyer quoi que ce soit au backend, l'application doit nettoyer et formater les médias.

* Transcription Audio en Texte : Embarquer un modèle de reconnaissance vocale local pour écouter les audios et les convertir immédiatement en texte écrit.
* Conversion d'Images en Base64 : Transformer automatiquement chaque image sélectionnée en une chaîne de caractères textuelle (Base64) standardisée.
* Concaténation et Formatage JSON : Fusionner tous les éléments dans une seule chaîne textuelle respectant le formatage attendu par le backend (avec le préfixe image: pour les images).

------------------------------
## 3. Interaction avec l'Utilisateur (Le Prompt)
L'utilisateur doit pouvoir guider l'intelligence artificielle sur le résultat souhaité.

* Saisie du Prompt Utilisateur : Un champ de texte dédié pour que l'utilisateur décrive ce qu'il veut (ex: "Fais un meme ironique sur la réaction de Pierre").
* Suggestions de styles (Optionnel pour la V1) : Proposer des boutons de raccourcis pour définir le ton du meme (Sarcastique, Dark humor, Absurde).

------------------------------
## 4. Communication avec le Backend & cycle de vie

* Envoi initial (api/new) : Envoyer le package JSON (Contexte + Prompt) pour initier la première création du meme.
* Demande de modification (api/update) : Envoyer une nouvelle requête avec le même contexte mais un prompt modifié pour corriger ou régénérer le meme.
* Gestion des états d'attente : Afficher un écran ou un indicateur de chargement animé pendant le traitement de l'IA (double étape : spécification textuelle + génération d'image).

------------------------------
## 5. Restitution et Partage du Meme
Une fois que le backend renvoie le meme généré en Base64, l'application doit permettre son exploitation.

* Affichage du Meme : Décoder le Base64 reçu pour afficher l'image du meme de manière claire et en plein écran.
* Téléchargement Local : Sauvegarder l'image finale directement dans l'album photo ou la galerie de l'appareil.
* Partage Natif : Ouvrir le menu de partage du téléphone pour envoyer instantanément le meme sur WhatsApp, Instagram, Facebook ou par message.

------------------------------






Ce flux est très clair et bien structuré. Il permet de bien séparer la configuration des données (le contexte) de l'intention de l'utilisateur (le prompt).
Voici le parcours utilisateur détaillé écran par écran, basé rigoureusement sur votre logique et vos schémas JSON.
------------------------------
## 🗺️ Parcours des Écrans et Flux Fonctionnel

[Écran 1: Choix du Type]
       │
       ├─► Nouvelle Génération ──► [Écran 3: Remplissage du Contexte]
       │
       └─► Mise à Jour ──────────► [Écran 2: Import de l'Image de Base] ──► [Écran 3: Remplissage du Contexte]
                                                                                      │
[Écran 5: Résultat / Réponse] ◄── [Bouton Envoyer] ◄── [Écran 4: Saisie du User Prompt] ◄─┘

------------------------------
## 📱 Détail Fonctionnel Écran par Écran## Écran 1 : Choix du Type de Génération [1] 
Cet écran d'accueil aiguille l'utilisateur selon son besoin actuel.

* Composants graphiques : Deux grands boutons distincts.
* Bouton "Créer un nouveau meme" ➡️ Redirige directement vers l'Écran 3.
   * Bouton "Mettre à jour un meme existant" ➡️ Redirige vers l'Écran 2.

## Écran 2 : Import de l'Image de Base (Uniquement pour le flux "Mise à jour")
Cet écran sert à capturer l'image existante que le modèle devra modifier ou faire évoluer.

* Composants graphiques : Un sélecteur de fichier (Galerie / Appareil photo).
* Traitement local : Dès que l'image est choisie, l'application la convertit immédiatement en chaîne de caractères.
* Variable stockée : base_image (Contient la string Base64).
* Action : Un bouton "Suivant" redirige vers l'Écran 3.

## Écran 3 : Remplissage du Contexte
C'est ici que l'utilisateur compose l'historique de la discussion WhatsApp. L'interface reste identique pour les deux flux.

* Composants de saisie :
* Zone d'ajout de texte.
   * Zone d'ajout de mémo vocal ➡️ Le module local transcrit l'audio en texte écrit.
   * Zone d'ajout d'image ➡️ L'image est convertie en Base64 et préfixée par image:. [2, 3, 4] 
* Traitement local : L'application concatène chronologiquement tous ces éléments.
* Variable stockée : context (Contient la string finale de la discussion).
* Action : Un bouton "Suivant" redirige vers l'Écran 4.

## Écran 4 : Saisie du User Prompt et Envoi
Cet écran isole la意图 (l'intention) de l'utilisateur pour ne pas surcharger l'écran du contexte.

* Composants graphiques :
* Un grand champ textuel pour saisir le user_prompt (ex: "Ajoute des yeux laser au personnage").
   * Un slider ou champ discret pour la temperature (par défaut à 0.7).
   * Bouton "Envoyer" : Déclenche l'appel API.
* Logique du Bouton Envoyer :
* Si flux Nouvelle Génération ➡️ Envoi du JSON new à l'endpoint api/new.
   * Si flux Mise à Jour ➡️ Envoi du JSON update (incluant base_image) à l'endpoint api/update.
   * L'application affiche un écran de chargement persistant pendant le traitement du backend et redirige vers l'Écran 5. [5] 

## Écran 5 : Page de Réponse (Résultat)
Cet écran réceptionne et affiche le travail finalisé.

* Composants graphiques :
* Une zone d'affichage d'image qui décode et affiche la string Base64 renvoyée par le backend.
   * Boutons d'action : 📥 Sauvegarder dans la galerie et 🔗 Partager sur les réseaux (WhatsApp, etc.).
   * Un bouton de retour à l'accueil pour recommencer un flux.

------------------------------
## 🛠️ Structure des Payloads JSON Générés
Voici exactement ce que votre application React Native préparera en arrière-plan sur l'Écran 4 avant de presser "Envoyer" :
## Cas 1 : Flux "Nouvelle Génération" (api/new)

{
  "context": "[14:32] Pierre: Tu as fini le rapport? \n [14:33] image:data:image/jpeg;base64,/9j/4AAQSkZJRg... \n [14:34] Marie: (Audio) Non pas encore, je galère !",
  "user_prompt": "Fais un meme drôle sur le stress de Marie",
  "temperature": 0.7
}

## Cas 2 : Flux "Mise à Jour" (api/update)

{
  "base_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "context": "[14:35] Pierre: Regarde ce meme que j'ai généré.",
  "user_prompt": "Change le texte du meme pour dire 'Quand le backend répond enfin'",
  "temperature": 0.7
}

