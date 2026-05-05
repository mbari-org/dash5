#!/bin/bash
# Runs the local dev server pointing at the real TethysDash backend
# for testing email notification fixes (Issue #518).
# .env.local is NOT modified — all other settings stay as localhost.
# Maps/LRAUV tracking data will not load (odss2dash is localhost only).
# Ctrl+C to stop and return to normal local dev.

export NEXT_PUBLIC_BASE_URL=http://okeanids.mbari.org:8080/TethysDash/api
export NEXT_API_HOST=http://okeanids.mbari.org:8080

echo "Starting dev server with TethysDash pointing to okeanids.mbari.org..."
echo "NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL"
echo "Maps/LRAUV data will not load (odss2dash stays on localhost) — that is expected."
echo ""

yarn workspace @mbari/lrauv-dash2 dev
