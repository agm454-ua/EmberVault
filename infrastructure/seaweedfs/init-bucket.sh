#!/bin/sh
set -ex

export "AWS_ACCESS_KEY_ID"="$(cat /run/secrets/seaweedfs_access_key)"
export "AWS_SECRET_ACCESS_KEY"="$(cat /run/secrets/seaweedfs_secret_key)"
export "S3_BUCKET"="$(cat /run/secrets/seaweedfs_bucket)"
export "SEAWEEDFS_PROFILE_PICTURES_BUCKET"="$(cat /run/secrets/seaweedfs_profile_pictures_bucket)"
echo "Waiting for S3 API to be ready..."
until aws --endpoint-url http://seaweedfs-s3:8333 s3 ls 2>/dev/null; do
    echo "S3 not ready, retrying in 3s..."
    sleep 3
done

echo "S3 is ready. Creating bucket..."
aws --endpoint-url http://seaweedfs-s3:8333 s3 mb s3://"${S3_BUCKET}" || true
aws --endpoint-url http://seaweedfs-s3:8333 s3 mb s3://"${SEAWEEDFS_PROFILE_PICTURES_BUCKET}" || true

# Set bucket policy to allow public read access to profile pictures
cat > /tmp/profile-pictures-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadProfilePictures",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::${SEAWEEDFS_PROFILE_PICTURES_BUCKET}/*"]
        }
    ]
}
EOF

aws --endpoint-url http://seaweedfs-s3:8333 s3api put-bucket-policy \
        --bucket "${SEAWEEDFS_PROFILE_PICTURES_BUCKET}" \
        --policy file:///tmp/profile-pictures-policy.json