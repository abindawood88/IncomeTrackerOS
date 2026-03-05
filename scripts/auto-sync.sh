#!/usr/bin/env bash
set -u

BRANCH="${1:-main}"
REMOTE="origin"
INTERVAL="${INTERVAL_SECONDS:-60}"

while true; do
  git add -A

  if ! git diff --cached --quiet; then
    git commit -m "auto update $(date -u +'%Y-%m-%dT%H:%M:%SZ')" || true

    if ! git pull --rebase "$REMOTE" "$BRANCH"; then
      echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] pull --rebase failed; stopping"
      break
    fi

    if ! git push "$REMOTE" "$BRANCH"; then
      echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] push failed; stopping"
      break
    fi
  fi

  sleep "$INTERVAL"
done
