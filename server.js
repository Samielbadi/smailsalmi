require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route publique (login)
app.use('/api/auth', require('./routes/auth'));
// Routes protegees JWT
app.use('/api/modules', require('./routes/modules'));
app.use('/api/seances', require('./routes/seances'));
app.use('/api/stats', require('./routes/stats'));

// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion simple des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur interne.' });
});

// Connexion MongoDB puis lancement serveur
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connecte.');
    app.listen(PORT, () =>
      console.log(`Serveur lance sur http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB:', err.message);
    process.exit(1);
  });