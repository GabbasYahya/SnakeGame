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

Voici comment le code est organisé dans le dossier  :

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



## 🕹️ Contrôles et Gameplay

*   **Flèches Directionnelles** : Diriger le serpent.
*   **Slider de Volume** (Haut Droite) : Ajuster le volume de la musique.
*   **Saisie du Nom** : À la fin de la partie, si le score est dans le Top 5, un champ apparaît.

---

## 🎞️ Écrans du Jeu

- **Menu principal** : titre, boutons `Play Snake` / `Play Apple`, sélection de couleur, leaderboard et import/export CSV.
- **Écran de jeu (Gameplay)** : affichage du canvas p5, HUD (score, vies, level, volume), power-ups et obstacles.
- **Transition de niveau / Message** : bref écran/overlay montrant "LEVEL X" ou "BOSS FIGHT".
- **Pause / Overlay d'information** : (message, règles rapides ou loader si nécessaire).
- **Écran Game Over** : score final, demande de saisie du nom si Top 5, option retour au menu.
- **Leaderboard** : affichage des Top 5 dans le menu avec export/import CSV.

## 🧭 Comportements (Steering Behaviors) — Commentaires

Le projet utilise plusieurs comportements de mouvement pour les entités (apple mobile, ennemis, obstacles dynamiques). Voici un bref commentaire utile pour comprendre et ajuster la logique :

- **Avoid (Éviter)** : calcule une force pour s'éloigner d'un obstacle ou d'une collision imminente. Utile pour les pommes qui fuient le serpent ou pour éviter qu'une entité ne percute un pic.
- **Wander (Errer)** : applique de petites forces aléatoires contrôlées pour donner un mouvement naturel non déterministe (utilisé pour des obstacles/bêtes qui se déplacent de façon organique).
- **Seek (Chercher)** : force dirigée vers une cible fixe (p.ex. un ennemi cherche la position actuelle du joueur). Rapide et direct.
- **Pursue (Poursuivre)** : version prédictive de `Seek` qui estime la position future de la cible (utile pour ennemis qui interceptent une pomme en mouvement).
- **Arrive (Arriver)** : similaire à `Seek` mais avec décélération progressive quand l'entité approche de la cible (utilisé pour que la queue du serpent suive en douceur ou pour des arrivées non brutales).

Ces comportements sont combinés via des poids/coefficients pour obtenir des mouvements crédibles (e.g. `force = seek*1.0 + avoid*1.5 + wander*0.2`).

## 🕹️ Jouer (Rappel rapide)

- **Modes** :
    - `PLAY_SNAKE` — vous contrôlez le serpent, l'objectif est d'attraper la pomme mobile.
    - `PLAY_APPLE` — vous êtes la pomme, objectif : survivre le plus longtemps.
- **Contrôles** :
    - **Souris** : dirige le serpent/la pomme (le serpent suit la souris).
    - **Clavier (menu)** : `1` lance `Play Snake`, `2` lance `Play Apple`, `M` revient au menu, `d` active le debug.
    - **Audio** : slider `Volume` (haut droite) pour ajuster en temps réel.

## 💡 Concept du Jeu

"Snake vs Apple" reprend la mécanique classique du Snake mais la modernise : la nourriture est mobile et intelligente, des ennemis et obstacles dynamiques ajoutent une dimension action/survie, et des phases de boss viennent casser le rythme pour proposer des combats scénarisés. Le mélange de comportements (seek/pursue/avoid) crée des situations imprévisibles et engageantes.

## 🎯 Objectif du Projet

- Créer une démo jouable et visuelle montrant des techniques de mouvement (steering behaviours) et de game design simple.
- Fournir un projet hébergeable en statique (GitHub Pages) avec options d'export/import de leaderboard pour conserver les meilleurs scores.
- Offrir une base pédagogique pour apprendre p5.js, les comportements d'agents et la structuration d'un petit jeu JavaScript.

## 🎬 Vidéo & Démo

Voici une courte vidéo de présentation du jeu :

<video controls width="720">
    <source src="assets/%C3%89crans%20du%20Jeu/Video.mp4" type="video/mp4">
    Votre navigateur ne supporte pas la lecture vidéo.
</video>

Lien vers la démo hébergée :

[Voir la démo en ligne](https://gabbasyahya.github.io/SnakeGame/3-Arrival/index.html)




