#!/bin/sh
# Copies the built calendar, widget and privacy pages plus store images into the website repo,
# which serves them at truthofmatthew.com/khorshid/. The landing pages there (index.html, en/,
# landing.css) belong to the website repo and are left alone.
# Usage: scripts/sync-site.sh /path/to/truthofmatthew-site
set -e
SITE="${1:?usage: scripts/sync-site.sh /path/to/truthofmatthew-site}"
node build.mjs
mkdir -p "$SITE/khorshid/screens"
rsync -a dist/web/ "$SITE/khorshid/"
for f in 1-dates 2-calendar 3-embed 4-settings 5-writing; do
  sips -s format jpeg -s formatOptions 82 "store/out/$f.png" --out "$SITE/khorshid/screens/$f.jpg" >/dev/null
done
cp store/out/og-1200x630.jpg "$SITE/khorshid/og.jpg"
cp public/icons/icon.svg "$SITE/khorshid/icon.svg"
echo "synced into $SITE/khorshid/"
