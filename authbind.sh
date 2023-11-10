#!/bin/sh
# authbind-like script to allow non-root user to bind to port 80

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 PORT COMMAND [ARG...]" >&2
  exit 1
fi

PORT="$1"
shift

touch "/etc/authbind/byport/$PORT"
chmod 500 "/etc/authbind/byport/$PORT"

exec authbind --deep "$@"
