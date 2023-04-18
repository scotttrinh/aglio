#!/bin/sh
# This script is run by CI after SSHing into the server. It runs migrations on the `aglio` database
# instance.
set -euo pipefail

echo "Running migrations..."
edgedb -I aglio migration apply
