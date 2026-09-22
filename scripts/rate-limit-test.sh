#!/usr/bin/env bash

set -u

URL="${1:-http://localhost:5000/api/v1/products}"

echo "Testing rate limit: $URL"
echo "Sending 110 requests..."

for i in $(seq 1 110); do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  echo "Request $i: HTTP $status"
done
