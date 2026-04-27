const path = require('path');
const fs = require('fs');

const files = [
  './models/User.js',
  './models/Module.js',
  './models/Session.js',
  './controllers/userController.js',
  './controllers/moduleController.js',
  './controllers/sessionController.js',
  './routes/userRoutes.js',
  './routes/moduleRoutes.js',
  './routes/sessionRoutes.js',
  './.env',
];

console.log('📁 فحص الملفات...\n');

files.forEach(f => {
  const exists = fs.existsSync(path.join(__dirname, f));
  console.log(`${exists ? '✅' : '❌'} ${f}`);
});