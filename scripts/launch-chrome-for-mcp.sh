#!/usr/bin/env bash
# Launch Chrome with remote debugging (port 9222) and open localhost:3000.
# The Chrome DevTools MCP in Cursor connects to this browser via --browser-url=http://127.0.0.1:9222
# Usage: ./scripts/launch-chrome-for-mcp.sh

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OPEN_URL="${1:-http://localhost:3000/}"

exec "$CHROME" --remote-debugging-port=9222 "$OPEN_URL"
