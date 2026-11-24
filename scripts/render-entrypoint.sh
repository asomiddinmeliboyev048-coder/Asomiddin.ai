#!/bin/sh
set -eu
DATA_DIR="${LMS_DATA_DIR:-/data}"
SECRET_FILE="/etc/secrets/lms-storage-state.json"
AUTH_DIR="$DATA_DIR/.auth"
TARGET_FILE="$AUTH_DIR/lms-storage-state.json"
mkdir -p "$AUTH_DIR"
if [ -f "$SECRET_FILE" ]; then
  cp "$SECRET_FILE" "$TARGET_FILE"
  chmod 600 "$TARGET_FILE"
elif [ ! -f "$TARGET_FILE" ]; then
  echo "ERROR: LMS session file is missing. Configure Render Secret File."
  exit 1
fi
exec npm run worker
