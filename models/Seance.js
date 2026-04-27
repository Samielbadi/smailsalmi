const mongoose = require('mongoose');

const seanceSchema = new mongoose.Schema({
  date: { type: String, required: true }, // format "YYYY-MM-DD"
  heureDebut: { type: String, required: true }, // format "HH:MM"
  heureFin: { type: String, required: true }, // format "HH:MM"
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true }, // ref -> modules
  moduleNom: { type: String, required: true, trim: true }, // denormalise
  formateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ref -> users
  formateurNom: { type: String, required: true, trim: true }, // denormalise
  objectif: { type: String, required: true, trim: true },
  deroulement: { type: String, required: true, trim: true },
  observations: { type: String, default: '', trim: true },
  suite: { type: String, default: '', trim: true }, // "suite a donner"
  heures: { type: Number, required: true, min: 0 }, // calcule automatiquement = heureFin - heureDebut
  valideParDirecteur: { type: Boolean, default: false }, // false par defaut
  dateValidation: { type: Date, default: null }, // null par defaut
  createdAt: { type: Date, default: Date.now }
}, {
  versionKey: false
});

module.exports = mongoose.model('Seance', seanceSchema);
