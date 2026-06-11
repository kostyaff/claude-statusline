#!/usr/bin/env bash
# Claude Code statusline installer (macOS / Linux)
# Usage (one-liner):
#   curl -fsSL https://raw.githubusercontent.com/kostyaff/claude-statusline/main/install.sh | bash
set -euo pipefail

RAW_BASE="https://raw.githubusercontent.com/kostyaff/claude-statusline/main"
CLAUDE_DIR="$HOME/.claude"
TARGET="$CLAUDE_DIR/statusline.js"
SETTINGS="$CLAUDE_DIR/settings.json"

mkdir -p "$CLAUDE_DIR"

# 1. Get statusline.js — from a local clone if present, otherwise download.
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [ -n "$SRC_DIR" ] && [ -f "$SRC_DIR/statusline.js" ]; then
  cp "$SRC_DIR/statusline.js" "$TARGET"
  echo "Copied statusline.js from local folder."
else
  curl -fsSL "$RAW_BASE/statusline.js" -o "$TARGET"
  echo "Downloaded statusline.js."
fi

# 2. Merge the statusLine entry into settings.json (preserving everything else).
CMD="node \"$TARGET\""
node -e '
const fs=require("fs");
const p=process.argv[1], cmd=process.argv[2];
let s={}; try{ s=JSON.parse(fs.readFileSync(p,"utf8")); }catch(e){}
s.statusLine={type:"command",command:cmd};
fs.writeFileSync(p, JSON.stringify(s,null,2));
' "$SETTINGS" "$CMD"

echo ""
echo "Done! Statusline installed. Restart Claude Code (or wait a tick) to see it."
