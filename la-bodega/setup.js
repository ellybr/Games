const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'node_modules', 'phaser', 'dist', 'phaser.min.js');
const destDir = path.join(__dirname, 'public', 'lib');
const dest = path.join(destDir, 'phaser.min.js');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (!fs.existsSync(src)) {
  console.error('ERROR: Phaser not found. Run "npm install" first.');
  process.exit(1);
}

fs.copyFileSync(src, dest);
const mb = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
console.log(`Phaser copied -> public/lib/phaser.min.js (${mb} MB)`);
