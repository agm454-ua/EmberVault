#!/bin/sh
set -ex

echo "Waiting for filer HTTP to be ready..."
until wget -q --spider http://seaweedfs-filer:8888/?limit=0 2>/dev/null; do
    echo "Filer HTTP not ready, retrying in 2s..."
    sleep 2
done

sleep 10

echo "Filer is ready. Generating s3.json..."
ACCESS_KEY=$(cat /run/secrets/seaweedfs_access_key)
SECRET_KEY=$(cat /run/secrets/seaweedfs_secret_key)
cat > /tmp/s3.json <<EOF
{
  "identities": [
    {
      "name": "admin",
      "credentials": [
        {
          "accessKey": "${ACCESS_KEY}",
          "secretKey": "${SECRET_KEY}"
        }
      ],
      "actions": ["Admin", "Read", "ReadAcp", "Write", "WriteAcp"]
    }
  ]
}
EOF

echo "Starting SeaweedFS S3..."
weed s3 -filer=seaweedfs-filer:8888 -port=8333 -config=/tmp/s3.json || echo "weed s3 FAILED with exit code $?"
sleep 30