/**
 * build.js — packages La Bodega for distribution
 *
 * Usage:
 *   node build.js
 *
 * Output:
 *   dist/la-bodega.zip  — ready to upload to itch.io or Netlify Drop
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT    = __dirname;
const PUBLIC  = path.join(ROOT, 'public');
const DIST    = path.join(ROOT, 'dist');
const PHASER_SRC = path.join(ROOT, 'node_modules', 'phaser', 'dist', 'phaser.min.js');
const PHASER_DST = path.join(PUBLIC, 'lib', 'phaser.min.js');

console.log('\n  La Bodega — Build\n');

// 1. Copy Phaser locally if needed
if (!fs.existsSync(PHASER_DST)) {
  if (!fs.existsSync(PHASER_SRC)) {
    console.error('  ERROR: Run "npm install" first.');
    process.exit(1);
  }
  fs.mkdirSync(path.join(PUBLIC, 'lib'), { recursive: true });
  fs.copyFileSync(PHASER_SRC, PHASER_DST);
  console.log('  ✓ Phaser copied to public/lib/');
} else {
  console.log('  ✓ Phaser already present');
}

// 2. Create dist folder
fs.mkdirSync(DIST, { recursive: true });
const ZIP = path.join(DIST, 'la-bodega.zip');
if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);

// 3. Zip the public folder (using system zip or fallback)
try {
  execSync(`cd "${ROOT}" && zip -r "${ZIP}" public/`, { stdio: 'inherit' });
  const sizeMB = (fs.statSync(ZIP).size / 1024 / 1024).toFixed(1);
  console.log(`\n  ✓ Built: dist/la-bodega.zip (${sizeMB} MB)\n`);
} catch (e) {
  // zip not available — write a tar.gz instead
  try {
    const TAR = path.join(DIST, 'la-bodega.tar.gz');
    execSync(`cd "${ROOT}" && tar -czf "${TAR}" public/`, { stdio: 'inherit' });
    const sizeMB = (fs.statSync(TAR).size / 1024 / 1024).toFixed(1);
    console.log(`\n  ✓ Built: dist/la-bodega.tar.gz (${sizeMB} MB)\n`);
  } catch (e2) {
    console.error('  ERROR creating archive. Make sure zip or tar is installed.');
    process.exit(1);
  }
}

console.log('  ─────────────────────────────────────────────');
console.log('  HOW TO PUBLISH\n');
console.log('  ITCH.IO (recommended for games):');
console.log('    1. Go to https://itch.io/game/new');
console.log('    2. Set "Kind of project" → HTML');
console.log('    3. Upload dist/la-bodega.zip');
console.log('    4. Check "This file will be played in the browser"');
console.log('    5. Set viewport: 1280 × 720');
console.log('    6. Publish!\n');
console.log('  NETLIFY (instant drag-and-drop):');
console.log('    1. Go to https://app.netlify.com/drop');
console.log('    2. Drag the entire "public/" folder onto the page');
console.log('    3. Your game is live in seconds\n');
console.log('  GITHUB PAGES:');
console.log('    git subtree push --prefix la-bodega/public origin gh-pages\n');
console.log('  LOCAL:');
console.log('    npm start  →  http://localhost:3000\n');
