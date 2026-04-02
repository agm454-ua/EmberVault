#!/bin/sh
set -e
apk add --no-cache openssl

if [ ! -f /certs/embervault.crt ]; then
  openssl req -x509 -nodes -days 825 \
    -newkey rsa:2048 \
    -keyout /certs/embervault.key \
    -out /certs/embervault.crt \
    -subj '/CN=embervault.local' \
    -addext 'subjectAltName=DNS:embervault,DNS:embervault.local,DNS:*.embervault.local,IP:127.0.0.1'
  echo 'Certificates generated.'
else
  echo 'Certificates already exist, skipping.'
fi