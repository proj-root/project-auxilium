import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { PID_FILE } from './config';

export default async function globalTeardown() {
  const server = (globalThis as any).__E2E_SERVER__;

  if (server && !server.killed) {
    server.kill('SIGTERM');
  } else if (existsSync(PID_FILE)) {
    // Fallback for the case where globalSetup and globalTeardown did not share
    // a module instance.
    const pid = Number(readFileSync(PID_FILE, 'utf8').trim());
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // already gone
    }
  }

  if (existsSync(PID_FILE)) unlinkSync(PID_FILE);

  // Postgres and Redis are deliberately left running — re-runs are much faster,
  // and the bootstrap script is idempotent.
}
