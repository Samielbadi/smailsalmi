const express = require('express');
const Module = require('../models/Module');
const Seance = require('../models/Seance');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRole('directeur'));

// GET /api/stats/modules -> heures realisees vs prevues par module
router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find({ actif: true }).sort({ ordre: 1, nom: 1 }).lean();
    const agg = await Seance.aggregate([
      {
        $group: {
          _id: '$moduleId',
          totalHeures: { $sum: '$heures' }
        }
      }
    ]);

    const mapHeures = new Map(agg.map((x) => [String(x._id), x.totalHeures]));
    const result = modules.map((m) => ({
      moduleId: m._id,
      moduleNom: m.nom,
      prevu: m.volumeHoraire,
      realise: Number((mapHeures.get(String(m._id)) || 0).toFixed(2))
    }));

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur stats modules.' });
  }
});

// GET /api/stats/formateurs -> heures totales par formateur
router.get('/formateurs', async (req, res) => {
  try {
    const stats = await Seance.aggregate([
      {
        $group: {
          _id: '$formateurId',
          formateurNom: { $first: '$formateurNom' },
          totalHeures: { $sum: '$heures' }
        }
      },
      { $sort: { formateurNom: 1 } }
    ]);

    return res.json(
      stats.map((s) => ({
        formateurId: s._id,
        formateurNom: s.formateurNom,
        totalHeures: Number(s.totalHeures.toFixed(2))
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Erreur stats formateurs.' });
  }
});

module.exports = router;
