#!/usr/bin/env bash
# Fails if app code contains network primitives (privacy guard).
set -u
dirs=()
for d in src app; do [ -d "$d" ] && dirs+=("$d"); done
[ ${#dirs[@]} -eq 0 ] && exit 0
if grep -rnE --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
  --exclude='*.test.*' '(fetch\(|XMLHttpRequest|axios|WebSocket)' "${dirs[@]}"; then
  echo "Privacy check FAILED: network usage found above." >&2
  exit 1
fi
echo "Privacy check passed: no network calls in app code."
