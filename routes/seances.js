const express = require('express');
const mongoose = require('mongoose');
const Seance = require('../models/Seance');
const Module = require('../models/Module');
const { verifyToken, requireRole } = require('../middleware/auth');
const demoData = require('../lib/demoData');

const router = express.Router();

router.use(verifyToken);

// POST /api/seances -> creer une seance (formateur)
router.post('/', requireRole('formateur'), async (req, res) => {
  try {
    const {
      date,
      heureDebut,
      heureFin,
      moduleId,
      objectif,
      deroulement,
      observations,
      suite,
      heures
    } = req.body;

    if (!date || !heureDebut || !heureFin || !moduleId || !objectif || !deroulement) {
      return res.status(400).json({ message: 'Champs obligatoires manquants.' });
    }

    if (!demoData.isDemoMode() && !mongoose.isValidObjectId(moduleId)) {
      return res.status(400).json({ message: 'Module invalide.' });
    }

    const moduleDoc = demoData.isDemoMode()
      ? await demoData.findModuleForFormateur(moduleId, req.user.id)
      : await Module.findOne({
          _id: moduleId,
          actif: true,
          formateurId: req.user.id
        });

    if (!moduleDoc) {
      return res.status(403).json({ message: 'Module non autorise pour ce formateur.' });
    }

    const payload = {
      date,
      heureDebut,
      heureFin,
      moduleId: moduleDoc._id,
      moduleNom: moduleDoc.nom,
      formateurId: req.user.id,
      formateurNom: req.user.nom,
      objectif,
      deroulement,
      observations: observations || '',
      suite: suite || '',
      heures: Number(heures)
    };

    const seance = demoData.isDemoMode()
      ? await demoData.createSeance(payload)
      : await Seance.create({
          ...payload,
          valideParDirecteur: false,
          dateValidation: null
        });

    return res.status(201).json(seance);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la creation de la seance.' });
  }
});

// GET /api/seances -> toutes les seances (directeur)
router.get('/', requireRole('directeur'), async (req, res) => {
  try {
    const seances = demoData.isDemoMode()
      ? await demoData.getAllSeances()
      : await Seance.find({}).sort({ date: -1, heureDebut: -1 });
    return res.json(seances);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la recuperation des seances.' });
  }
});

// PATCH /api/seances/:id/valider -> valider une seance (directeur)
router.patch('/:id/valider', requireRole('directeur'), async (req, res) => {
  try {
    if (!demoData.isDemoMode() && !mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Identifiant de seance invalide.' });
    }

    const seance = demoData.isDemoMode()
      ? await demoData.validateSeance(req.params.id)
      : await Seance.findByIdAndUpdate(
          req.params.id,
          { valideParDirecteur: true, dateValidation: new Date() },
          { new: true }
        );

    if (!seance) {
      return res.status(404).json({ message: 'Seance introuvable.' });
    }

    return res.json(seance);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la validation.' });
  }
});

module.exports = router;
