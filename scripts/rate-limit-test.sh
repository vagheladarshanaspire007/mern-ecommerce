#!/usr/bin/env bash

set -u

BASE_URL="${1:-http://localhost:5000}"
REQUEST_COUNT="${2:-110}"
TARGET_URL="${BASE_URL%/}/api/v1/products"
FIRST_429_AT=""

echo "Testing rate limit against: ${TARGET_URL}"
echo "Sending ${REQUEST_COUNT} requests..."

for request_number in $(seq 1 "${REQUEST_COUNT}"); do
  status_code="$(curl -s -o /dev/null -w '%{http_code}' "${TARGET_URL}")"
  echo "Request ${request_number}: ${status_code}"

  if [[ "${status_code}" == "429" && -z "${FIRST_429_AT}" ]]; then
    FIRST_429_AT="${request_number}"
  fi
done

if [[ -n "${FIRST_429_AT}" ]]; then
  echo "First 429 observed at request ${FIRST_429_AT}."
  exit 0
fi

echo "No 429 response observed after ${REQUEST_COUNT} requests."
exit 1
