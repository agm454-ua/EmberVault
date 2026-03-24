#!/bin/sh
set -ex

export AWS_ACCESS_KEY_ID=$(cat /run/secrets/seaweedfs_access_key)
export AWS_SECRET_ACCESS_KEY=$(cat /run/secrets/seaweedfs_secret_key)

echo "Waiting for S3 API to be ready..."
until aws --endpoint-url http://seaweedfs-s3:8333 s3 ls 2>/dev/null; do
    echo "S3 not ready, retrying in 3s..."
    sleep 3
done

echo "S3 is ready. Creating bucket..."
aws --endpoint-url http://seaweedfs-s3:8333 s3 mb s3://files || true