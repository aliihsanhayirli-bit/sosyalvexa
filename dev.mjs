#!/usr/bin/env node
// GYD Grup - Cross-platform development starter (Node.js ile)

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { platform } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isWin = platform === 'win32';

const pocketbaseExe = isWin ? 'pocketbase.exe' : 'pocketbase';

function start(name, cmd, args, cwd, color) {
  const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: isWin });
  child.on('error', (e) => console.error(`[${name}]`, e.message));
  process.on('exit', () => child.kill());
  return child;
}

console.log('\n\x1b[36m%s\x1b[0m', '━'.repeat(50));
console.log('\x1b[36m  GYD Grup — Development\x1b[0m');
console.log('\x1b[36m━\x1b[0m'.repeat(25) + '\n');

const pb = start('PocketBase', path.join(__dirname, 'backend', pocketbaseExe), ['serve'], path.join(__dirname, 'backend'));
const vite = start('Vite', 'npm', ['run', 'dev'], __dirname);

console.log('\x1b[32m[OK]\x1b[0m PocketBase → http://localhost:8090/_/');
console.log('\x1b[32m[OK]\x1b[0m Site      → http://localhost:5173');
console.log('\x1b[32m[OK]\x1b[0m Admin     → http://localhost:5173/admin\n');

process.on('SIGINT', () => { pb.kill(); vite.kill(); process.exit(); });
