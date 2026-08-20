import { spawn } from 'node:child_process';

const command = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'pnpm';
const args = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'pnpm exec playwright test tests/e2e/visual.spec.ts']
  : ['exec', 'playwright', 'test', 'tests/e2e/visual.spec.ts'];
const child = spawn(command, args, { stdio: 'inherit' });
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('close', (code) => { process.exitCode = code ?? 1; });
