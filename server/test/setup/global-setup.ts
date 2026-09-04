// Brings the whole backend up once, before any spec runs:
//   services -> migrations -> reference data -> build -> boot the real server.
//
// The suite drives a real HTTP server rather than an in-process Nest app on
// purpose. `better-auth` and `@thallesp/nestjs-better-auth` are ESM-only
// (`"type": "module"`, no `require` export condition), and Jest's CommonJS
// runtime cannot require them. Node itself can (`require(esm)` on Node 22),
// which is exactly how production runs — so booting the compiled server as a
// subprocess exercises the real auth stack instead of a stub.

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  E2E_BASE_URL,
  E2E_PORT,
  PID_FILE,
  REPO_ROOT,
  SERVER_DIR,
  loadTestEnv,
} from './config';

const run = (command: string, args: string[], cwd: string) =>
  execFileSync(command, args, { cwd, env: process.env, stdio: 'inherit' });

async function waitForHealth(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${E2E_BASE_URL}/api/health`);
      if (res.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error(`Test server did not become healthy at ${E2E_BASE_URL}`);
}

export default async function globalSetup() {
  loadTestEnv();

  console.log('\n[e2e] starting postgres + redis');
  run(
    'bash',
    [resolve(SERVER_DIR, 'test/scripts/start-test-services.sh')],
    SERVER_DIR,
  );

  if (process.env.E2E_SKIP_BUILD !== '1') {
    console.log('[e2e] building workspaces');
    run(
      'npm',
      ['run', 'build', '-w', '@auxilium/configs', '-w', '@auxilium/types'],
      REPO_ROOT,
    );
    run('npm', ['run', 'build', '-w', 'server'], REPO_ROOT);
  }

  if (!existsSync(resolve(SERVER_DIR, 'dist/src/main.js'))) {
    throw new Error(
      'server/dist/src/main.js is missing — run the build without E2E_SKIP_BUILD',
    );
  }

  console.log('[e2e] applying migrations');
  run('npx', ['drizzle-kit', 'migrate'], SERVER_DIR);

  // Reference tables (status, role, department, course, event types/roles) are
  // mandatory: forum_post.statusId has a foreign key to `status`, and the
  // better-auth sign-up hook inserts a user_role row keyed to `role`.
  console.log('[e2e] seeding reference data');
  run('node', ['dist/src/db/seed.js', '--prod'], SERVER_DIR);

  console.log(`[e2e] booting server on port ${E2E_PORT}`);
  const server = spawn('node', ['dist/src/main.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(E2E_PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  server.stdout.on('data', (chunk) => {
    if (process.env.E2E_VERBOSE === '1')
      process.stdout.write(`[server] ${chunk}`);
  });
  server.stderr.on('data', (chunk) => {
    if (process.env.E2E_VERBOSE === '1')
      process.stderr.write(`[server] ${chunk}`);
  });

  await waitForHealth();
  console.log('[e2e] server is healthy\n');

  writeFileSync(PID_FILE, String(server.pid));
  (globalThis as any).__E2E_SERVER__ = server;
}
