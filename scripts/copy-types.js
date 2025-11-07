#!/usr/bin/env node
import { copyFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

// Ensure dist directory exists
mkdirSync(distDir, { recursive: true });

// Type definition files to copy
const typeFiles = [
  'reducer.d.ts',
  'interfaceParser.d.ts',
  'jsonSchemaParser.d.ts'
];

// Copy each file
typeFiles.forEach(file => {
  const src = join(srcDir, file);
  const dest = join(distDir, file);
  try {
    copyFileSync(src, dest);
    console.log(`✓ Copied ${file}`);
  } catch (error) {
    console.error(`✗ Failed to copy ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('✓ All type definitions copied successfully');
