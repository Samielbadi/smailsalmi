# Suivi pedagogique - Node.js / Express / MongoDB

Application web de suivi pedagogique pour un centre de formation, avec deux roles:
- `formateur`: saisie des seances
- `directeur`: consultation globale + validation + statistiques

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
JWT_SECRET=une-cle-secrete-forte
PORT=3000
```

> Le code accepte aussi `MONGO_URI` pour compatibilite.

## Installation et lancement

```bash
npm install
node seed.js
node server.js
```

Puis ouvrir [http://localhost:3000](http://localhost:3000)

## Comptes de test

- Directeur: `directeur@test.com` / `dir123`
- Formateur: `tarik@test.com` / `1234`
- Formateur: `soumaya@test.com` / `1234`

## API exposee

- `POST /api/auth/login`
- `GET /api/modules`
- `GET /api/modules/miens`
- `POST /api/seances`
- `GET /api/seances`
- `PATCH /api/seances/:id/valider`
- `GET /api/stats/modules`
- `GET /api/stats/formateurs`

## Structure des vues frontend

Un seul fichier `public/index.html` avec 3 vues:
- vue login
- vue saisie formateur
- vue dashboard directeur

L'affichage est controle en JS via `display` (classe `hidden`) selon le role retourne au login.
