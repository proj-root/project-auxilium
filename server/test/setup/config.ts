// Shared constants and env loading for the integration harness.
//
// Values live here rather than being passed through process env, because
// variables set in `globalSetup` do not reliably reach the test workers.

import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const SERVER_DIR = resolve(__dirname, '../..');
export const REPO_ROOT = resolve(SERVER_DIR, '..');

/** Deliberately not 5175, so a running dev server does not collide. */
export const E2E_PORT = 5176;
export const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}`;

export const PID_FILE = resolve(SERVER_DIR, 'test', '.e2e-server.pid');

/**
 * Local, disposable defaults. `server/.env.test` is gitignored, so the suite
 * has to work on a fresh clone without one; drop a `.env.test` in place to
 * override any of these. Bring the services up with
 * `bash server/test/scripts/start-test-services.sh`.
 */
const DEFAULTS: Record<string, string> = {
  DATABASE_URL:
    'postgresql://garden_test:garden_test@127.0.0.1:5432/garden_test',
  // Deliberately 'development': auth.ts only disables the origin and CSRF
  // checks in development, and supertest sends no Origin header, so sign-up
  // and sign-in would otherwise be rejected. Jest defaults NODE_ENV to 'test'.
  NODE_ENV: 'development',
  APP_NAME: 'SEED GARDEN Terminal Test',
  AUTH_SECRET: 'integration-test-secret-not-for-production-use-only',
  AUTH_BASE_URL: `http://localhost:${E2E_PORT}`,
  CLIENT_URL: 'http://localhost:5173',
  COOKIE_MAXAGE: '604800',
  REDIS_HOST: '127.0.0.1',
  LOG_LEVEL: 'error',
};

/** Loads `.env.test` when present, then fills in anything still unset. */
export function loadTestEnv() {
  const envFile = resolve(SERVER_DIR, '.env.test');

  if (existsSync(envFile)) {
    config({ path: envFile, override: true });
  }

  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (!process.env[key]) process.env[key] = value;
  }
}
