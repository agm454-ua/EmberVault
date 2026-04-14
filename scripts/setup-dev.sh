#!/bin/bash

# This script generates local SSL certificates for local development and deployment.
# Do not use on production environments.

set -e

CERT_DIR="../infrastructure/certs"
DOMAIN="embervault.local"

echo "🔧 Setting up local HTTPS..."

# 1. Install mkcert if missing
if ! command -v mkcert &> /dev/null
then
  echo "Installing mkcert..."

  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install mkcert nss
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt update
    sudo apt install -y libnss3-tools
    curl -L https://dl.filippo.io/mkcert/latest?for=linux/amd64 -o mkcert
    chmod +x mkcert
    sudo mv mkcert /usr/local/bin/
  else
    echo "Unsupported OS. Install mkcert manually."
    exit 1
  fi
fi

# 2. Install local CA
echo "Installing local CA..."
mkcert -install

# 3. Generate certs if missing
mkdir -p $CERT_DIR

if [ ! -f "$CERT_DIR/embervault.crt" ]; then
  echo "Generating certificates..."
  mkcert -key-file $CERT_DIR/embervault.key -cert-file $CERT_DIR/embervault.crt "$DOMAIN" "*.$DOMAIN"
else
  echo "Certificates already exist"
fi

# 4. Ensure hosts entry exists
if ! grep -q "$DOMAIN" /etc/hosts; then
  echo "Adding domain to /etc/hosts..."
  echo "127.0.0.1 $DOMAIN" | sudo tee -a /etc/hosts
else
  echo "Hosts entry already exists"
fi
