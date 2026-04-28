const User = require('../models/User');
const demoData = require('../lib/demoData');

// Recupere l'utilisateur actif depuis un simple identifiant transmis par le frontend.
async function verifyToken(req, res, next) {
  try {
    const userId = String(req.headers['x-user-id'] || '').trim();

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur manquant.' });
    }

    const user = demoData.isDemoMode()
      ? await demoData.findActiveUserById(userId)
      : await User.findOne({ _id: userId, actif: true }).select('_id nom role');

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur invalide.' });
    }

    req.user = {
      id: user._id.toString(),
      nom: user.nom,
      role: user.role
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Utilisateur invalide.' });
  }
}

// Middleware de controle des roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acces refuse.' });
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole };
