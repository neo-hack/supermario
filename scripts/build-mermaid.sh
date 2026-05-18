#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

SUBMODULE="vendor/beautiful-mermaid"
OUTPUT="skills/codemermaid/assets/beautiful-mermaid.bundle.js"

if [ ! -f "$SUBMODULE/src/browser.ts" ]; then
  echo "Initializing submodule $SUBMODULE..."
  git submodule update --init "$SUBMODULE"
fi

bun build "./$SUBMODULE/src/browser.ts" --target=browser --minify --outfile="$OUTPUT"

SIZE=$(wc -c < "$OUTPUT" | tr -d ' ')
echo "Built $OUTPUT ($(( SIZE / 1024 )) KB)"
