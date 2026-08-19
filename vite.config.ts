import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const nodeEnvironment = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const repositoryName = nodeEnvironment.GITHUB_REPOSITORY?.split('/').pop();

export default defineConfig({
  plugins: [react()],
  base: nodeEnvironment.GITHUB_ACTIONS === 'true' && repositoryName ? `/${repositoryName}/` : '/',
});
