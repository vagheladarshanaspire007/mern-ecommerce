#!/usr/bin/env bash

set -u

URL="${1:-http://localhost:5000/api/v1/products}"
RATE_LIMIT_HIT=0

echo "Testing rate limit: $URL"
echo "Sending 110 requests..."

for i in $(seq 1 110); do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  echo "Request $i: HTTP $status"

  if [ "$status" = "429" ]; then
    RATE_LIMIT_HIT=1
  fi
done

if [ "$RATE_LIMIT_HIT" -eq 1 ]; then
  echo "PASS: Rate limit returned HTTP 429."
  exit 0
fi

echo "FAIL: No HTTP 429 response received."
exit 1