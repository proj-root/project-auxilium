#!/usr/bin/env bash
#
# Boots the local services the integration tests need: a PostgreSQL cluster
# with a dedicated `garden_test` role/database, and a Redis instance (the
# RedisService connects on module init, so AppModule will not boot without it).
#
# Idempotent — safe to re-run.

set -euo pipefail

PG_VERSION="${PG_VERSION:-16}"
PG_CLUSTER="${PG_CLUSTER:-main}"
TEST_DB="${TEST_DB:-garden_test}"
TEST_ROLE="${TEST_ROLE:-garden_test}"
TEST_PASSWORD="${TEST_PASSWORD:-garden_test}"
REDIS_PORT="${REDIS_PORT:-6379}"

echo "==> Starting PostgreSQL ${PG_VERSION}/${PG_CLUSTER}"
if pg_isready --quiet; then
  echo "    already running"
else
  pg_ctlcluster "${PG_VERSION}" "${PG_CLUSTER}" start
  # The cluster accepts connections a moment after pg_ctlcluster returns.
  for _ in $(seq 1 20); do
    pg_isready --quiet && break
    sleep 0.5
  done
fi
pg_isready

psql_as_postgres() {
  su postgres -c "psql -v ON_ERROR_STOP=1 -tAc \"$1\""
}

echo "==> Ensuring role '${TEST_ROLE}'"
if [ "$(psql_as_postgres "SELECT 1 FROM pg_roles WHERE rolname='${TEST_ROLE}'")" = "1" ]; then
  echo "    already exists"
else
  psql_as_postgres "CREATE ROLE ${TEST_ROLE} LOGIN PASSWORD '${TEST_PASSWORD}'"
fi

echo "==> Ensuring database '${TEST_DB}'"
if [ "$(psql_as_postgres "SELECT 1 FROM pg_database WHERE datname='${TEST_DB}'")" = "1" ]; then
  echo "    already exists"
else
  psql_as_postgres "CREATE DATABASE ${TEST_DB} OWNER ${TEST_ROLE}"
fi

echo "==> Starting Redis on port ${REDIS_PORT}"
if redis-cli -p "${REDIS_PORT}" ping >/dev/null 2>&1; then
  echo "    already running"
else
  redis-server --daemonize yes --port "${REDIS_PORT}" --save ''
  for _ in $(seq 1 20); do
    redis-cli -p "${REDIS_PORT}" ping >/dev/null 2>&1 && break
    sleep 0.5
  done
fi
redis-cli -p "${REDIS_PORT}" ping

echo "==> Test services ready"
