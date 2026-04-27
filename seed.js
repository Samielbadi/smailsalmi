require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Module = require('./models/Module');
const Seance = require('./models/Seance');

async function runSeed() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('MongoDB connecte. Debut du seed...');

    await Promise.all([
      User.deleteMany({}),
      Module.deleteMany({}),
      Seance.deleteMany({})
    ]);

    // Hash des mots de passe de test
    const [hashDir, hashFormateur1, hashFormateur2] = await Promise.all([
      bcrypt.hash('dir123', 10),
      bcrypt.hash('1234', 10),
      bcrypt.hash('1234', 10)
    ]);

    const [directeur, tarik, soumaya] = await User.insertMany([
      { nom: 'Directeur Principal', email: 'directeur@test.com', password: hashDir, role: 'directeur', actif: true },
      { nom: 'El Khomsi Tarik', email: 'tarik@test.com', password: hashFormateur1, role: 'formateur', actif: true },
      { nom: 'Alaoui Ismaili Soumaya', email: 'soumaya@test.com', password: hashFormateur2, role: 'formateur', actif: true }
    ]);

    const modules = await Module.insertMany([
      { nom: 'Production orale', volumeHoraire: 50, formateurId: tarik._id, formateurNom: 'El Khomsi Tarik', ordre: 1, actif: true },
      { nom: 'Comprehension ecrite', volumeHoraire: 30, formateurId: tarik._id, formateurNom: 'El Khomsi Tarik', ordre: 2, actif: true },
      { nom: 'Grammaire appliquee', volumeHoraire: 40, formateurId: soumaya._id, formateurNom: 'Alaoui Ismaili Soumaya', ordre: 3, actif: true }
    ]);

    await Seance.insertMany([
      { date: '2026-04-10', heureDebut: '09:00', heureFin: '12:00', moduleId: modules[0]._id, moduleNom: modules[0].nom, formateurId: tarik._id, formateurNom: tarik.nom, objectif: 'Ameliorer la prise de parole', deroulement: 'Atelier + jeux de role', observations: 'Bonne participation', suite: 'Travail individuel', heures: 3, valideParDirecteur: true, dateValidation: new Date(), createdAt: new Date() },
      { date: '2026-04-12', heureDebut: '10:00', heureFin: '12:00', moduleId: modules[1]._id, moduleNom: modules[1].nom, formateurId: tarik._id, formateurNom: tarik.nom, objectif: 'Lire un texte argumentatif', deroulement: 'Analyse de textes', observations: 'Rythme correct', suite: 'Exercice a la maison', heures: 2, valideParDirecteur: false, dateValidation: null, createdAt: new Date() },
      { date: '2026-04-15', heureDebut: '14:00', heureFin: '17:00', moduleId: modules[2]._id, moduleNom: modules[2].nom, formateurId: soumaya._id, formateurNom: soumaya.nom, objectif: 'Consolider les regles de base', deroulement: 'Cours + application', observations: 'Besoin de repetition', suite: 'Revision guidee', heures: 3, valideParDirecteur: true, dateValidation: new Date(), createdAt: new Date() },
      { date: '2026-04-18', heureDebut: '09:30', heureFin: '11:30', moduleId: modules[0]._id, moduleNom: modules[0].nom, formateurId: tarik._id, formateurNom: tarik.nom, objectif: 'Prendre la parole en continu', deroulement: 'Simulation orale', observations: 'Amelioration nette', suite: 'Feedback personnalise', heures: 2, valideParDirecteur: false, dateValidation: null, createdAt: new Date() },
      { date: '2026-04-20', heureDebut: '13:00', heureFin: '16:00', moduleId: modules[2]._id, moduleNom: modules[2].nom, formateurId: soumaya._id, formateurNom: soumaya.nom, objectif: 'Maitriser les accords', deroulement: 'Exercices progressifs', observations: 'Niveau heterogene', suite: 'Fiches de remediations', heures: 3, valideParDirecteur: false, dateValidation: null, createdAt: new Date() },
      { date: '2026-04-22', heureDebut: '08:30', heureFin: '10:30', moduleId: modules[1]._id, moduleNom: modules[1].nom, formateurId: tarik._id, formateurNom: tarik.nom, objectif: 'Lire un document administratif', deroulement: 'Lecture guidee', observations: 'Bon engagement', suite: 'Test de comprehension', heures: 2, valideParDirecteur: true, dateValidation: new Date(), createdAt: new Date() }
    ]);

    console.log('Seed termine avec succes.');
    console.log('Directeur: directeur@test.com / dir123');
    console.log('Formateur 1: tarik@test.com / 1234');
    console.log('Formateur 2: soumaya@test.com / 1234');
    console.log(`Utilisateurs crees: ${[directeur, tarik, soumaya].length}`);
  } catch (error) {
    console.error('Erreur seed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runSeed();