# This script generates local SSL certificates for local development and deployment.
# Do not use on production environments.

$ErrorActionPreference = "Stop"

$CERT_DIR = "..\infrastructure\certs"
$DOMAIN = "embervault.local"

# 1. Install mkcert if missing
if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
    Write-Host "mkcert not found. Installing via Chocolatey..."

    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "Chocolatey is required. Install it first: https://chocolatey.org/install"
        exit 1
    }

    choco install mkcert -y
}

# 2. Install local CA
Write-Host "Installing local CA..."
mkcert -install

# 3. Generate certs
if (-not (Test-Path $CERT_DIR)) {
    New-Item -ItemType Directory -Path $CERT_DIR | Out-Null
}

if (-not (Test-Path "$CERT_DIR\embervault.crt")) {
    Write-Host "Generating certificates..."
    mkcert -key-file "$CERT_DIR\embervault.key" -cert-file "$CERT_DIR\embervault.crt" $DOMAIN "*.$DOMAIN"
} else {
    Write-Host "Certificates already exist"
}

# 4. Update hosts file
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsPath

if ($hostsContent -notmatch $DOMAIN) {
    Write-Host "Adding domain to hosts file..."
    Add-Content $hostsPath "`n127.0.0.1 $DOMAIN"
} else {
    Write-Host "Hosts entry already exists"
}
