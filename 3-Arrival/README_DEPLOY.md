Déploiement du backend optionnel

1) Créez un dépôt GitHub et poussez le contenu du dossier `3-Arrival`.

2) Backend optionnel (Node/Express)
   - Le backend se trouve dans `server/` et expose :
     - `POST /api/scores` { name: string, score: number }
     - `GET  /api/scores` retourne `scores.csv`
   - Pour exécuter localement :
```powershell
cd server
npm install
npm start
```

3) Déployer depuis GitHub
   - Recommandé : Render (https://render.com), Railway ou Heroku. Connectez votre repo GitHub et déployez le dossier `server` comme service Node.
   - Une fois déployé, récupérez l'URL publique (ex: `https://my-snake-scores.onrender.com`) et dans le fichier `index.html` ou via la console du navigateur définissez `window.SCORE_SERVER_BASE` à cette URL.

4) Sécurité
   - Le backend ci-dessus est minimal et ne contient pas d'authentification. Pour une utilisation publique, ajoutez une clé API ou une méthode d'auth.
