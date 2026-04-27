const bcrypt = require('bcrypt');

const users = [
  {
    _id: 'u1',
    nom: 'Directeur Principal',
    email: 'directeur@test.com',
    password: bcrypt.hashSync('dir123', 10),
    role: 'directeur',
    actif: true
  },
  {
    _id: 'u2',
    nom: 'El Khomsi Tarik',
    email: 'tarik@test.com',
    password: bcrypt.hashSync('1234', 10),
    role: 'formateur',
    actif: true
  },
  {
    _id: 'u3',
    nom: 'Alaoui Ismaili Soumaya',
    email: 'soumaya@test.com',
    password: bcrypt.hashSync('1234', 10),
    role: 'formateur',
    actif: true
  }
];

const modules = [
  { _id: 'm1', nom: 'Production orale', volumeHoraire: 50, formateurId: 'u2', formateurNom: 'El Khomsi Tarik', ordre: 1, actif: true },
  { _id: 'm2', nom: 'Comprehension ecrite', volumeHoraire: 30, formateurId: 'u2', formateurNom: 'El Khomsi Tarik', ordre: 2, actif: true },
  { _id: 'm3', nom: 'Grammaire appliquee', volumeHoraire: 40, formateurId: 'u3', formateurNom: 'Alaoui Ismaili Soumaya', ordre: 3, actif: true }
];

const seances = [
  { _id: 's1', date: '2026-04-10', heureDebut: '09:00', heureFin: '12:00', moduleId: 'm1', moduleNom: 'Production orale', formateurId: 'u2', formateurNom: 'El Khomsi Tarik', objectif: 'Ameliorer la prise de parole', deroulement: 'Atelier + jeux de role', observations: 'Bonne participation', suite: 'Travail individuel', heures: 3, valideParDirecteur: true, dateValidation: new Date().toISOString(), createdAt: new Date().toISOString() },
  { _id: 's2', date: '2026-04-12', heureDebut: '10:00', heureFin: '12:00', moduleId: 'm2', moduleNom: 'Comprehension ecrite', formateurId: 'u2', formateurNom: 'El Khomsi Tarik', objectif: 'Lire un texte argumentatif', deroulement: 'Analyse de textes', observations: 'Rythme correct', suite: 'Exercice a la maison', heures: 2, valideParDirecteur: false, dateValidation: null, createdAt: new Date().toISOString() },
  { _id: 's3', date: '2026-04-15', heureDebut: '14:00', heureFin: '17:00', moduleId: 'm3', moduleNom: 'Grammaire appliquee', formateurId: 'u3', formateurNom: 'Alaoui Ismaili Soumaya', objectif: 'Consolider les regles de base', deroulement: 'Cours + application', observations: 'Besoin de repetition', suite: 'Revision guidee', heures: 3, valideParDirecteur: true, dateValidation: new Date().toISOString(), createdAt: new Date().toISOString() }
];

function sortByModule(list) {
  return [...list].sort((a, b) => (a.ordre - b.ordre) || a.nom.localeCompare(b.nom));
}

function sortSeancesDesc(list) {
  return [...list].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    return dateCompare || b.heureDebut.localeCompare(a.heureDebut);
  });
}

function createId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

module.exports = {
  isDemoMode() {
    return process.env.DEMO_MODE === 'true' || !(
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.MONGODB_URL ||
      process.env.DATABASE_URL
    );
  },

  async findActiveUserByEmail(email) {
    return users.find((user) => user.actif && user.email === email) || null;
  },

  async getActiveModules() {
    return sortByModule(modules.filter((module) => module.actif));
  },

  async getModulesForFormateur(formateurId) {
    return sortByModule(modules.filter((module) => module.actif && module.formateurId === formateurId));
  },

  async findModuleForFormateur(moduleId, formateurId) {
    return modules.find((module) => module._id === moduleId && module.actif && module.formateurId === formateurId) || null;
  },

  async createSeance(payload) {
    const seance = {
      _id: createId('s'),
      ...payload,
      observations: payload.observations || '',
      suite: payload.suite || '',
      valideParDirecteur: false,
      dateValidation: null,
      createdAt: new Date().toISOString()
    };
    seances.push(seance);
    return seance;
  },

  async getAllSeances() {
    return sortSeancesDesc(seances);
  },

  async validateSeance(id) {
    const seance = seances.find((item) => item._id === id);
    if (!seance) {
      return null;
    }

    seance.valideParDirecteur = true;
    seance.dateValidation = new Date().toISOString();
    return seance;
  },

  async getModuleStats() {
    const activeModules = await this.getActiveModules();
    return activeModules.map((module) => {
      const realise = seances
        .filter((seance) => seance.moduleId === module._id)
        .reduce((sum, seance) => sum + Number(seance.heures || 0), 0);

      return {
        moduleId: module._id,
        moduleNom: module.nom,
        prevu: module.volumeHoraire,
        realise: Number(realise.toFixed(2))
      };
    });
  },

  async getFormateurStats() {
    const totals = new Map();

    for (const seance of seances) {
      const current = totals.get(seance.formateurId) || {
        formateurId: seance.formateurId,
        formateurNom: seance.formateurNom,
        totalHeures: 0
      };
      current.totalHeures += Number(seance.heures || 0);
      totals.set(seance.formateurId, current);
    }

    return [...totals.values()]
      .map((item) => ({
        ...item,
        totalHeures: Number(item.totalHeures.toFixed(2))
      }))
      .sort((a, b) => a.formateurNom.localeCompare(b.formateurNom));
  }
};
