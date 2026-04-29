#!/bin/sh

envsubst < /usr/local/etc/redis/users.acl.template > /usr/local/etc/redis/users.acl

exec redis-server /usr/local/etc/redis/redis.conf