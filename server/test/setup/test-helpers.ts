// Helpers for the integration suite.
//
// Everything here talks either plain HTTP or plain `pg`. The suite deliberately
// avoids importing `AppModule` (or anything that reaches better-auth), because
// those packages are ESM-only and Jest's CommonJS runtime cannot require them.

import { Pool } from 'pg';
import request from 'supertest';
import { E2E_BASE_URL } from './config';

export const api = () => request(E2E_BASE_URL);

let pool: Pool | undefined;

export function db(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

export type TestUser = {
  userId: string;
  email: string;
  cookie: string[];
};

/**
 * Registers a user through the real better-auth endpoint and returns their
 * session cookie.
 *
 * Users have to be created this way rather than inserted directly: the
 * `/sign-up` after-hook is what creates the `user_role` row that `RoleGuard`
 * reads through the enriched session.
 */
export async function signUpUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}): Promise<TestUser> {
  const res = await api()
    .post('/api/auth/sign-up/email')
    .send({ email, password, name });

  if (res.status >= 400) {
    throw new Error(
      `Sign-up failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`,
    );
  }

  const cookie = res.headers['set-cookie'] as unknown as string[];
  if (!cookie?.length) {
    throw new Error(`Sign-up for ${email} returned no session cookie`);
  }

  const { rows } = await db().query<{ id: string }>(
    'SELECT id FROM "user" WHERE email = $1',
    [email],
  );

  if (!rows[0]) throw new Error(`User ${email} not found after sign-up`);

  return { userId: rows[0].id, email, cookie };
}

/**
 * Replaces a user's role.
 *
 * The existing row is deleted first rather than added to: `user_role` has a
 * composite primary key on (userId, roleId), so a plain insert would leave the
 * user with two rows, and `enrichSessionUserDetails` picks one with an
 * unordered `findFirst`.
 */
export async function setUserRole(userId: string, roleId: number) {
  const client = await db().connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM user_role WHERE user_id = $1', [userId]);
    await client.query(
      'INSERT INTO user_role (user_id, role_id) VALUES ($1, $2)',
      [userId, roleId],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/** Clears forum rows between tests, leaving users and reference data intact. */
export async function truncateForum() {
  await db().query(
    'TRUNCATE TABLE forum_comment, forum_post RESTART IDENTITY CASCADE',
  );
}

/** Clears every account so a run starts from a known state. */
export async function truncateUsers() {
  await db().query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');
}

export async function getPostRow(postId: string) {
  const { rows } = await db().query(
    'SELECT post_id, status_id, created_by FROM forum_post WHERE post_id = $1',
    [postId],
  );
  return rows[0];
}

export async function countComments(postId: string) {
  const { rows } = await db().query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM forum_comment WHERE post_id = $1',
    [postId],
  );
  return Number(rows[0]!.count);
}

/** Depth-first walk of a comment tree, collecting `text` values in order. */
export function flattenTree(
  nodes: Array<{ text: string; replies: any[] }>,
  depth = 0,
): Array<{ text: string; depth: number }> {
  return nodes.flatMap((node) => [
    { text: node.text, depth },
    ...flattenTree(node.replies ?? [], depth + 1),
  ]);
}
