const express = require('express');
const Module = require('../models/Module');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes de ce fichier sont protegees
router.use(verifyToken);

// GET /api/modules -> tous les modules actifs
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find({ actif: true }).sort({ ordre: 1, nom: 1 });
    return res.json(modules);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur de recuperation des modules.' });
  }
});

// GET /api/modules/miens -> modules du formateur connecte
router.get('/miens', async (req, res) => {
  try {
    const modules = await Module.find({
      actif: true,
      formateurId: req.user.id
    }).sort({ ordre: 1, nom: 1 });
    return res.json(modules);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur de recuperation de vos modules.' });
  }
});

module.exports = router;
