# Riff Guardian: The Silence Slayer

**Auteur :** Rémi Dalmasso Herrera
**Cours :** L3 MIAGE - Développement WEB (M. Buffa)
**Année :** 2025-2026

---

## 🎸 Description du Jeu
**Riff Guardian** est un jeu de tir en vue de dessus (Top-Down Shooter) développé en HTML5 Canvas "Vanilla JS".
Le joueur incarne un musicien combattant des entités de "Silence" à l'aide de sa guitare électrique orbitale. Le but est de survivre le plus longtemps possible à travers des niveaux infinis dont la difficulté et les couleurs changent progressivement.

🔗 **[Lien vers la démo jouable]** *lien*

---

## 🎮 Comment Jouer

* **Déplacement :** Touches `Z`, `Q`, `S`, `D` ou les `Flèches directionnelles`.
* **Viser :** La souris (la guitare suit le curseur).
* **Tirer :** `Clic Gauche` ou `Barre Espace`.
* **Debug Mode :** Case à cocher "Debug" pour voir les vecteurs de direction et les hitboxes.
* **God Mode :** Case à cocher "God Mode" pour activer un bouclier réflecteur (les ennemis rebondissent).

---

## 🏗️ Conception Technique & Bonnes Pratiques

Conformément aux consignes du cours, j'ai mis l'accent sur une architecture robuste et l'usage des transformations graphiques.

### 1. Architecture Modulaire (ES6)
Le projet n'est pas codé "à plat". J'ai utilisé des modules ES6 avec import/export :
* `Game.js` : Le chef d'orchestre (Boucle de jeu, Gestion des états, Niveaux).
* `Entity.js` : Classe mère gérant la position et le dessin de base.
* `Player.js`, `Enemy.js`, `Bullet.js` : Classes filles héritant de `Entity`.
* `InputListeners.js` : Gestion centralisée des événements clavier/souris.

### 2. Transformations Géométriques (`ctx.translate`, `ctx.rotate`)
C'est le cœur du moteur graphique :
* **Dessin en (0,0) :** Tous les objets (ennemis, joueur) sont dessinés en coordonnées locales (0,0) après un `ctx.translate(this.x, this.y)`.
* **Hiérarchie (Guitare) :** La guitare utilise un arbre de scène simple :
    1.  `translate` au joueur.
    2.  `rotate` vers la souris.
    3.  `translate` vers l'orbite (décalage).
    4.  Dessin de la guitare.
    Cela évite d'avoir à calculer manuellement la position X/Y de la guitare avec de la trigonométrie complexe.

### 3. Gestion des Assets
Le sprite de la guitare (`guitar.png`) est chargé de manière asynchrone.
* Si l'image est chargée : je l'affiche avec `drawImage`.
* Si l'image échoue ou charge lentement : le jeu dessine automatiquement une forme vectorielle de secours (Fallback) pour que le jeu reste jouable.

---

## 🤖 Utilisation de l'IA

Conformément à la charte du TP, voici l'usage fait des outils d'IA générative :

* **Outil :** Gemini 3 Pro (Google).
* **Rôle :** Assistant de conception ("Thought Partner").
* **Parties générées / assistées :**
    * Génération du squelette des classes ES6 (boilerplate code).
    * Aide mathématique pour le calcul de réflexion vectorielle (méthode `bounce` des ennemis en mode God Mode).
    * Suggestion de l'algorithme HSL pour les couleurs de fond infinies.
    * Génération de l'image de la guitare (Sprite).
* **Apport personnel :**
    * J'ai structuré l'architecture des modules.
    * J'ai implémenté manuellement la logique de chargement des assets (gestion asynchrone des images).
    * J'ai réglé la physique du jeu et l'équilibrage des niveaux.
    * J'ai vérifié et compris la logique de rendu (`ctx.save/restore`) pour respecter le cours.

---

## ✨ Fonctionnalités dont je suis fier

1.  **Système de Rebond Vectoriel :**
    En mode "God Mode", les ennemis ne sont pas juste arrêtés. Je calcule le vecteur normal au point d'impact pour faire rebondir les ennemis linéaires (`Linear`) avec un angle réaliste (comme une boule de billard).

2.  **Gestion de la Difficulté :**
    Le jeu est infini.
    * **Temps :** Chaque niveau dure 10s + 2s par niveau supplémentaire.
    * **Couleurs :** Le fond change de couleur (Teinte HSL + offset aléatoire) à chaque niveau pour garantir que chaque niveau a une ambiance unique mais lisible.
    * **Ennemis :** Apparition progressive de nouveaux types (Kamikazes au niv 1, Guidés au niv 2, Tanks au niv 3).

3.  **High Scores persistants :**
    Utilisation de `localStorage` pour sauvegarder et afficher le Top 5 des meilleurs scores, même après fermeture du navigateur.

---

## ⚠️ Difficultés Rencontrées

* **Chargement de l'image :** Au début, le jeu plantait car j'essayais de dessiner l'image de la guitare avant qu'elle ne soit chargée par le navigateur. **Solution :** J'ai ajouté un flag `isSpriteLoaded` et une condition dans le `draw()` pour utiliser une version vectorielle en attendant.
* **Vecteurs de Debug :** Afficher la direction des ennemis nécessitait de bien comprendre le repère local. J'ai dû faire le `ctx.moveTo(0,0)` *après* le `translate` de l'ennemi pour que la ligne parte bien de son centre.