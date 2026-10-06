#!/usr/bin/env bash
# Miniatures du portfolio public (2026-10-06) — une capture propre de la page d'accueil de chaque maquette,
# 1280×800 sans écran d'ouverture (?anim=off), réduite en JPEG 1024×640 dans artifacts/portfolio/public/maquettes/.
# Le site public (section « Réalisations ») lit /maquettes/<slug>.jpg ; une maquette sans miniature affiche
# un cadre neutre à son nom. À relancer pour chaque nouvelle maquette : scripts/capture-maquettes.sh <slug>
# Usage : scripts/capture-maquettes.sh [slug…]   (sans argument : toutes les maquettes de DEMOS)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/artifacts/portfolio/public/maquettes"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP="$(mktemp -d)"
mkdir -p "$OUT"
if [ $# -gt 0 ]; then SLUGS="$*"; else
  SLUGS=$(grep -oE '^  [a-z0-9]+: \{ target' "$ROOT/artifacts/api-server/src/lib/demo-redirect.ts" | awk '{print $1}' | tr -d ':')
fi
# Pas de --user-data-dir : avec un profil neuf, Chrome 150 headless ne rend jamais la main (testé le 06/10) ;
# sans l'option, chaque capture prend 4 s. D'où aussi l'exécution en série : un seul profil par défaut.
capture() {
  local slug="$1"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1280,800 --force-device-scale-factor=1 \
    --virtual-time-budget=6000 --screenshot="$TMP/$slug.png" \
    "https://$slug-demo.pages.dev/?anim=off" >/dev/null 2>&1 || { echo "ÉCHEC $slug"; return; }
  python3 - "$TMP/$slug.png" "$OUT/$slug.jpg" <<'PY'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB").resize((1024, 640), Image.LANCZOS)
im.save(sys.argv[2], "JPEG", quality=82, optimize=True, progressive=True)
PY
  echo "OK $slug"
}
for s in $SLUGS; do capture "$s"; done
rm -rf "$TMP"
