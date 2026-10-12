#!/bin/bash
# Recompress one dish webp to under 100KB.
# Tries quality 65/60 at widths 800/640/480 (only downscaling, never upscaling),
# keeps the FIRST setting that lands under 100KB so we keep max quality/size.
# Writes back via cat to preserve the original file's permissions/inode.
f="$1"
size=$(stat -c%s "$f" 2>/dev/null) || { echo "FAIL-STAT $f"; exit 1; }
if [ "$size" -lt 102400 ]; then
  echo "SKIP $f ($size bytes, already under 100KB)"
  exit 0
fi
tmp="/tmp/recompress_$$_$RANDOM.webp"
trap 'rm -f "$tmp"' EXIT
for spec in "65:800" "60:800" "65:640" "60:640" "65:480" "60:480" "50:480"; do
  q="${spec%%:*}"; w="${spec##*:}"
  if ! ffmpeg -y -v error -i "$f" -vf "scale='min(iw,$w)':-2" -c:v libwebp -quality "$q" -preset photo "$tmp" 2>/dev/null; then
    echo "FAIL-ENC $f (q$q ${w}px)"
    exit 1
  fi
  ns=$(stat -c%s "$tmp")
  if [ "$ns" -lt 102400 ]; then
    cat "$tmp" > "$f"
    echo "OK $f $size->$ns (q$q max${w}px)"
    exit 0
  fi
done
# Nothing got under 100KB; keep the smallest (last) attempt anyway.
ns=$(stat -c%s "$tmp")
cat "$tmp" > "$f"
echo "FALLBACK $f $size->$ns (STILL OVER 100KB, q50 max480px)"
exit 2
