#!/bin/sh
set -e

echo "Running database migrations..."
npm run db:deploy --workspace=server

echo "Seeding database..."
npm run seed:prod --workspace=server

echo "Starting server..."
exec "$@"