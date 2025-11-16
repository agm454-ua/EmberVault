
CREATE TYPE status AS ENUM ('active', 'suspended', 'deleted');

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    parent_folder UUID
);

CREATE TABLE folders (
    id UUID PRIMARY KEY REFERENCES resources(id) ON DELETE CASCADE
);

-- parent_folder foreign key after creating folders table
ALTER TABLE resources 
ADD CONSTRAINT fk_parent_folder 
FOREIGN KEY (parent_folder) REFERENCES folders(id) ON DELETE CASCADE;

CREATE TABLE files (
    id UUID PRIMARY KEY REFERENCES resources(id) ON DELETE CASCADE,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    is_private BOOLEAN DEFAULT false,
    storage_path VARCHAR(500) NOT NULL,
    checksum VARCHAR(64),
    is_compressed BOOLEAN DEFAULT false,
    thumbnail_path VARCHAR(500)
);

CREATE TABLE images (
    id UUID PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
    width_px SMALLINT,
    height_px SMALLINT
);

CREATE TABLE videos (
    id UUID PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
    width_px SMALLINT,
    height_px SMALLINT,
    duration_seconds SMALLINT,
    video_codec VARCHAR(20),
    frame_rate SMALLINT,
    bitrate INTEGER,
    audio_codec VARCHAR(20)
);

CREATE TABLE audio (
    id UUID PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
    duration_seconds SMALLINT,
    audio_codec VARCHAR(20),
    bitrate INTEGER
);

CREATE TABLE system_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    action VARCHAR(50) NOT NULL
);

CREATE TABLE system_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200)
);

CREATE TABLE system_role_permissions (
    role_id UUID REFERENCES system_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES system_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(40) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    status status DEFAULT 'active',
    storage_limit_gb SMALLINT DEFAULT 15,
    storage_used_gb NUMERIC(10,2) DEFAULT 0,
    avatar_url VARCHAR(500),
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    root_folder UUID NOT NULL REFERENCES folders(id),
    system_role UUID NOT NULL REFERENCES system_roles(id)
);

CREATE TABLE resource_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    action VARCHAR(50) NOT NULL
);

CREATE TABLE resource_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200)
);

CREATE TABLE resource_role_permissions (
    role_id UUID REFERENCES resource_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES resource_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_is_resource_role_for_resource (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_role UUID REFERENCES resource_roles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, resource_role, resource_id)
);
