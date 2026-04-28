const express = require('express');
const User = require('../models/User');
const demoData = require('../lib/demoData');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = demoData.isDemoMode()
      ? await demoData.listActiveUsers()
      : await User.find({ actif: true })
          .select('_id nom role')
          .sort({ role: 1, nom: 1 })
          .lean();

    return res.json(
      users.map((user) => ({
        id: user._id.toString(),
        nom: user.nom,
        role: user.role
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la recuperation des profils.' });
  }
});

module.exports = router;
