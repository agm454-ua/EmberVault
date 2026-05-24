#!/bin/bash
set -e

cd "$(dirname "$0")"

# Create tables
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 01-tables/011-create-resources.sql
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 01-tables/012-create-rbac.sql
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 01-tables/013-create-users.sql

# Create indexes
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 02-indexes/021-indexes.sql

# Create triggers
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 03-triggers/031-auto-update.sql
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 03-triggers/032-prevent-circular-folder-hierarchy.sql
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 03-triggers/033-create-root-folder.sql

# Execute seeders
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 04-seed/041-rbac-seeder.sql
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 04-seed/042-user-seeder.sql

# Run test seeders if in test environment
if [ "$APP_ENV" = "test" ]; then
    echo "Running test environment seeders..."
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f 05-seed-test/051-test-data-seeder.sql
fi

# Create db roles
bash 99-post-init/991-create-db-roles.sh