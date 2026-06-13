#!/bin/bash
# Launches the World Cup 2026 app: starts the local server (needed for live
# scores) and opens your browser. Keep this window open while watching.

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
PROJECT="$HOME/worldcup-bracket"
URL="http://localhost:5173"

cd "$PROJECT" || { echo "Project folder not found at $PROJECT"; exit 1; }

if curl -s -o /dev/null "$URL"; then
  echo "Already running — opening browser…"
  open "$URL"
  exit 0
fi

echo "Starting World Cup 2026… opening your browser shortly."
echo "(Keep this window open while you watch. Close it to stop.)"

( until curl -s -o /dev/null "$URL"; do sleep 0.5; done; open "$URL" ) &

npm run dev
