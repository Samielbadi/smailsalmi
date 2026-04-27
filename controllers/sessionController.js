const Session = require('../models/Session');
const User = require('../models/User');
const Module = require('../models/Module');

// POST /sessions
exports.createSession = async (req, res) => {
  try {
    const { moduleId, formateurId, ...rest } = req.body;

    // Auto-fill names
    const module = await Module.findById(moduleId);
    const formateur = await User.findById(formateurId);

    if (!module) return res.status(404).json({ error: 'Module not found' });
    if (!formateur) return res.status(404).json({ error: 'Formateur not found' });

    const session = new Session({
      ...rest,
      moduleId,
      moduleNom: module.nom,
      formateurId,
      formateurNom: `${formateur.prenom} ${formateur.nom}`
    });

    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /sessions  (with optional filters)
exports.getSessions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) {
      const d = new Date(req.query.date);
      filter.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999))
      };
    }
    if (req.query.moduleId) filter.moduleId = req.query.moduleId;
    if (req.query.formateurId) filter.formateurId = req.query.formateurId;

    const sessions = await Session.find(filter).sort({ date: 1, heureDebut: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /sessions/grouped-by-date
exports.getSessionsGroupedByDate = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: 1, heureDebut: 1 });

    const grouped = {};
    for (const session of sessions) {
      const key = session.date.toISOString().split('T')[0]; // "YYYY-MM-DD"
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(session);
    }

    // Convert to array of { date, seances[] }
    const result = Object.entries(grouped).map(([date, seances]) => ({
      date,
      totalHeures: seances.reduce((sum, s) => sum + s.heures, 0),
      seances
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /sessions/:id
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /sessions/:id
exports.updateSession = async (req, res) => {
  try {
    const { moduleId, formateurId, ...rest } = req.body;
    const update = { ...rest };

    if (moduleId) {
      const module = await Module.findById(moduleId);
      if (!module) return res.status(404).json({ error: 'Module not found' });
      update.moduleId = moduleId;
      update.moduleNom = module.nom;
    }
    if (formateurId) {
      const formateur = await User.findById(formateurId);
      if (!formateur) return res.status(404).json({ error: 'Formateur not found' });
      update.formateurId = formateurId;
      update.formateurNom = `${formateur.prenom} ${formateur.nom}`;
    }

    const session = await Session.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /sessions/:id
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /sessions/summary  — total hours per module with progress %
exports.getSummary = async (req, res) => {
  try {
    const Module = require('../models/Module');
    const modules = await Module.find();
    const sessions = await Session.find();

    const summary = modules.map(mod => {
      const modSessions = sessions.filter(s => s.moduleId.toString() === mod._id.toString());
      const totalHeures = modSessions.reduce((sum, s) => sum + s.heures, 0);
      const progress = mod.volumeHoraire > 0
        ? ((totalHeures / mod.volumeHoraire) * 100).toFixed(1)
        : 0;
      return {
        moduleId: mod._id,
        moduleNom: mod.nom,
        volumeHoraire: mod.volumeHoraire,
        totalHeures,
        progress: `${progress}%`
      };
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};