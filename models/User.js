const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true }, // ex: "Alaoui Ismaili Soumaya"
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // hash avec bcrypt
  role: { type: String, required: true, enum: ['formateur', 'directeur'] }, // "formateur" ou "directeur"
  actif: { type: Boolean, default: true }, // true par defaut
  createdAt: { type: Date, default: Date.now }
}, {
  versionKey: false
});

module.exports = mongoose.model('User', userSchema);