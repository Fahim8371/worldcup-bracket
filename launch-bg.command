#!/bin/bash
# Background launcher: starts the dev server (detached) if it isn't already
# running, waits until it responds, then opens the browser. No Terminal window.

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
PROJECT="$HOME/worldcup-bracket"
URL="http://localhost:5173"
LOG="/tmp/worldcup-bracket.log"

cd "$PROJECT" || exit 1

# Start the server detached (survives this script exiting) if not already up.
if ! curl -s -o /dev/null "$URL"; then
  nohup npm run dev >"$LOG" 2>&1 &
  disown 2>/dev/null
fi

# Wait up to ~30s for the server, then open the browser.
for _ in $(seq 1 60); do
  if curl -s -o /dev/null "$URL"; then break; fi
  sleep 0.5
done

open "$URL"
