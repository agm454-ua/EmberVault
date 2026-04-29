#!/bin/sh

sed "s|__REDIS_BACKEND_PASSWORD__|$REDIS_BACKEND_PASSWORD|g" \
  /usr/local/etc/redis/users.acl.template \
  > /usr/local/etc/redis/users.acl

echo "Redis ACL generated"

exec redis-server /usr/local/etc/redis/redis.conf