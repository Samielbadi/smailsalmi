const jwt = require('jsonwebtoken');

// Verifie la presence et la validite du token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token manquant.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      nom: payload.nom,
      role: payload.role
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expire.' });
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