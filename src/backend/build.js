#!/usr/bin/env node

/**
 * Build script to prepare app.js for production
 * Copies src/backend/app.js to root app.js with adjusted require paths
 */

const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'app.js');
const targetFile = path.join(__dirname, '..', '..', 'app.js');

console.log('🔨 Building app.js for production...');
console.log(`📖 Reading from: ${sourceFile}`);

try {
  let content = fs.readFileSync(sourceFile, 'utf8');

  // Replace relative paths to account for the file being in the root directory
  content = content.replace(/require\('\.\/services\//g, "require('./src/backend/services/");
  content = content.replace(/require\('\.\/lib\//g, "require('./src/backend/lib/");
  content = content.replace(/require\('\.\/routes\//g, "require('./src/backend/routes/");
  content = content.replace(/require\('\.\/aria-api/g, "require('./src/backend/aria-api");

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log(`✅ Successfully built app.js to: ${targetFile}`);
  console.log('✨ Ready for production deployment!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

