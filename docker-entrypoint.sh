#!/bin/sh
set -e



echo "Running database migrations..."
npx prisma migrate deploy   # or "npm run migrate:deploy" if you have a script

echo "Starting app..."
exec npm run start:prod
