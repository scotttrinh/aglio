#!/bin/sh
# This script is run by CI after SSHing into the server. It detects the current color of the running
# app (blue or green), starts up the other color, and then polls the new service for a 2XX response,
# and then shuts down the old service.
set -euo pipefail
if [ $(docker ps -f name=blue -q) ]; then
  NEW="green"
  OLD="blue"
else
  NEW="blue"
  OLD="green"
fi

echo "Starting $ENV"
docker compose --project-name=$ENV up -d

echo "Polling healthcheck"
until $(curl --output /dev/null --silent --head --fail http://localhost:3000/api/healthcheck); do
  printf '.'
  sleep 1
done

echo "Stopping $OLD"
docker compose --project-name=$OLD stop
