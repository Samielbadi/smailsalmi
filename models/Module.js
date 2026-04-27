const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true }, // ex: "Production orale"
  volumeHoraire: { type: Number, required: true, min: 0 }, // total heures prevues
  formateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ref -> users
  formateurNom: { type: String, required: true, trim: true }, // denormalise pour affichage rapide
  ordre: { type: Number, required: true, default: 0 }, // ordre d'affichage
  actif: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  versionKey: false
});

module.exports = mongoose.model('Module', moduleSchema);