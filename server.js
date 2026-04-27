require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
let dbConnectionPromise;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getConfigError() {
  if (!MONGODB_URI) {
    return 'MONGODB_URI is missing.';
  }

  if (!JWT_SECRET) {
    return 'JWT_SECRET is missing.';
  }

  return null;
}

function ensureDatabaseConnection() {
  const configError = getConfigError();

  if (configError) {
    return Promise.reject(new Error(configError));
  }

  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = mongoose.connect(MONGODB_URI)
      .then(() => {
        console.log('MongoDB connecte.');
        return mongoose.connection;
      })
      .catch((err) => {
        dbConnectionPromise = null;
        throw err;
      });
  }

  return dbConnectionPromise;
}

app.use('/api', async (req, res, next) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch (err) {
    next(err);
  }
});

// Route publique (login)
app.use('/api/auth', require('./routes/auth'));
// Routes protegees JWT
app.use('/api/modules', require('./routes/modules'));
app.use('/api/seances', require('./routes/seances'));
app.use('/api/stats', require('./routes/stats'));

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    databaseReady: mongoose.connection.readyState === 1
  });
});

// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion simple des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  const message = err && err.message ? err.message : 'Erreur serveur interne.';
  const isConfigError = message === 'MONGODB_URI is missing.' || message === 'JWT_SECRET is missing.';
  const isMongoError = err && (
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoServerSelectionError' ||
    /mongo/i.test(message)
  );

  if (isConfigError) {
    return res.status(500).json({ message });
  }

  if (isMongoError) {
    return res.status(500).json({ message: 'Connexion a la base de donnees impossible.' });
  }

  return res.status(500).json({ message: 'Erreur serveur interne.' });
});

module.exports = app;

if (!process.env.VERCEL) {
  const configError = getConfigError();

  if (configError) {
    console.error(configError);
    process.exit(1);
  }

  ensureDatabaseConnection()
    .then(() => {
      app.listen(PORT, () =>
        console.log(`Serveur lance sur http://localhost:${PORT}`)
      );
    })
    .catch((err) => {
      console.error('Erreur de connexion MongoDB:', err.message);
      process.exit(1);
    });
}
