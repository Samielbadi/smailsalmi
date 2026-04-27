const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /api/auth/login -> retourne JWT + { nom, role }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe sont obligatoires.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim(), actif: true });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), nom: user.nom, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

module.exports = router;
