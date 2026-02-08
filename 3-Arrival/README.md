# 🐍 Snake vs Apple - Projet "Arrival"

Auteurs : GABBAS Yahya & AIT EL MAHJOUB Salaheddine

## 📋 Description du Projet

Ce jeu est une version modernisée et "arcade" du classique Snake, développé en **JavaScript** avec la bibliothèque **p5.js**. Il intègre des mécaniques de survie, des combats de boss, des power-ups et une gestion dynamique de la difficulté.

### 🎮 Fonctionnalités Principales

*   **Système de Vies** : Le joueur commence avec 3 cœurs (affichés en haut à gauche).
*   **Modes de Jeu** : Exploration classique et Phases de Boss.
*   **Ennemis & Dangers** :
    *   *Bombes* : Explosent après un compte à rebours.
    *   *Serpents Ennemis* : Traversent l'écran horizontalement ou verticalement (annoncés par une alerte rouge).
    *   *Obstacles* : Des boules à pointes qui rebondissent.
*   **Power-ups** :
    *   *Bonus (Or)* : Ajoute +2 au score.
    *   *Bouclier (Bleu)* : Invincibilité temporaire.
*   **Boss** : Apparaît tous les 5 niveaux avec des phases d'attaque différentes.
*   **Audio** : Musique de fond avec un **slider de volume** en temps réel.
*   **Leaderboard** : Sauvegarde des 5 meilleurs scores en local (Local Storage).

---

## 📂 Structure des Fichiers

Voici comment le code est organisé dans le dossier `3-Arrival` :

| Fichier | Description |
| :--- | :--- |
| **`index.html`** | Point d'entrée. Charge les bibliothèques p5.js et tous les scripts du jeu. |
| **`sketch.js`** | **Cœur du jeu**. Contient le `setup()`, la boucle principale `draw()`, la gestion des états (Game Over, Menu), l'UI (Volume, Score) et le spawning. |
| **`snake.js`** | Contient la classe `Snake`. Gère le dessin du serpent (effet néon/hexagones) et ses mouvements. |
| **`hazards.js`** | Contient les classes `Bomb` (bombes statiques) et `EnemySnake` (serpents traversants). |
| **`boss.js`** | Contient la classe `Boss`. Gère l'IA du boss, ses phases d'attaque (tir de bombes) et son affichage. |
| **`vehicle.js`** | Classe parente `Vehicle` pour la physique (vitesse, accélération) et classe `Obstacle` (pics). |
| **`assets/`** | Dossier contenant les médias (Musique `.mp3`, Police `.otf`). |

---

## 🚀 Installation et Lancement

Puisque le projet utilise p5.js et charge des fichiers externes (sons, images), il **doit être lancé via un serveur local** pour éviter les erreurs CORS (Cross-Origin Resource Sharing).

1.  **Ouvrir le projet** dans VS Code.
2.  S'assurer que l'extension **Live Server** est installée.
3.  Faire un clic droit sur `3-Arrival/index.html` -> **"Open with Live Server"**.

Alternativement, ouvrir via un serveur Python :
```bash
cd 3-Arrival
python -m http.server
```

---

## 🕹️ Contrôles et Gameplay

*   **Flèches Directionnelles** : Diriger le serpent.
*   **Slider de Volume** (Haut Droite) : Ajuster le volume de la musique.
*   **Saisie du Nom** : À la fin de la partie, si le score est dans le Top 5, un champ apparaît.

---

## 🛠️ Dernières Modifications (Log)

*   **Fix Critique** : Correction des crashs liés à `inputName` (variable déclarée globalement).
*   **UI** : Remplacement du bouton "Mute" par un **Slider de Volume**. Affichage des vies sous forme de **Cœurs rouges**.
*   **Gameplay** :
    *   Les pommes rapportent maintenant **+1 point**.
    *   Les bonus rapportent **+2 points**.
    *   Les *Serpents Ennemis* peuvent désormais arriver de **Haut** et de **Bas** (pas seulement gauche/droite).
*   **Graphismes** : Suppression de la grille de fond pour plus de clarté.

---

## 📝 À Faire (To-Do List pour le collègue)

Si tu reprends le projet, voici les prochaines étapes suggérées :

1.  **Graphismes (Assets)** : Remplacer les formes géométriques (rectangles/ellipses) par de vraies images `.png` (sprites).
    *   *Voir la liste des assets recommandés dans la conversation précédente.*
2.  **Équilibrage** : Le Boss est parfois trop difficile au niveau 10. Ajuster sa vitesse dans `boss.js`.
3.  **Mobile** : Ajouter des boutons tactiles pour jouer sur téléphone.

**Bon courage ! 🚀**
