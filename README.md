# Suivi pedagogique - Node.js / Express / MongoDB

Application web de suivi pedagogique pour un centre de formation, avec deux roles:
- `formateur`: saisie des seances
- `directeur`: consultation globale + validation + statistiques

L'application ne demande plus de connexion: l'utilisateur choisit simplement un profil au demarrage.

## Stack

- Node.js
- Express
- MongoDB + Mongoose
- HTML/CSS/JS vanilla
- Chart.js via CDN

## Variables d'environnement

Creer un fichier `.env` a la racine:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/suivi_pedagogique
PORT=3000
```

> Le code accepte aussi `MONGO_URI`, `MONGODB_URL` et `DATABASE_URL` pour compatibilite.

## Installation et lancement

```bash
npm install
node seed.js
node server.js
```

Puis ouvrir [http://localhost:3000](http://localhost:3000)

## Deploiement

### Mode test sans MongoDB

Si aucune variable MongoDB n'est definie, l'application demarre en mode demo avec des donnees en memoire.
Cela permet de tester rapidement sur Vercel sans MongoDB.
Vous pouvez aussi forcer ce mode avec `DEMO_MODE=true`.

Profils disponibles en mode demo:

- `Directeur Principal`
- `El Khomsi Tarik`
- `Alaoui Ismaili Soumaya`

Attention: les donnees creees en mode demo ne sont pas persistantes et peuvent etre reinitialisees a tout moment.

### Option recommandee: Render + MongoDB Atlas

Le projet inclut maintenant un fichier `render.yaml`, donc Render peut detecter automatiquement la configuration.

1. Pousser le projet sur GitHub.
2. Creer une base MongoDB Atlas et recuperer l'URI de connexion.
3. Sur Render, creer un nouveau `Blueprint` ou `Web Service` depuis le depot GitHub.
4. Renseigner les variables d'environnement:

```env
MONGODB_URI=mongodb+srv://...
```

5. Lancer le deploy.
6. Si besoin de donnees de demo, executer `npm run seed` en local en pointant vers la base MongoDB distante.

Le service expose aussi `GET /health` pour la verification d'etat.

### Autres hebergeurs compatibles

- Railway
- Fly.io
- Toute VM / VPS avec Node.js et MongoDB Atlas

Le point d'entree est `server.js` et la commande de demarrage est:

```bash
npm start
```

### Vercel

Pour Vercel, definir au minimum:

```env
MONGODB_URI=mongodb+srv://...
```

Si votre projet Vercel utilise deja un autre nom de variable, l'application accepte aussi `MONGO_URI`, `MONGODB_URL` et `DATABASE_URL`.

## Profils de test

- Directeur: `Directeur Principal`
- Formateur: `El Khomsi Tarik`
- Formateur: `Alaoui Ismaili Soumaya`

## API exposee

- `GET /api/modules`
- `GET /api/modules/miens`
- `GET /api/profiles`
- `POST /api/seances`
- `GET /api/seances`
- `PATCH /api/seances/:id/valider`
- `GET /api/stats/modules`
- `GET /api/stats/formateurs`

## Structure des vues frontend

Un seul fichier `public/index.html` avec 3 vues:
- vue selection de profil
- vue saisie formateur
- vue dashboard directeur

L'affichage est controle en JS via `display` (classe `hidden`) selon le profil choisi.
