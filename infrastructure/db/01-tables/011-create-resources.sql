CREATE TYPE status AS ENUM (
    'active',
    'suspended',
    'deleted'
);

CREATE TYPE state AS ENUM (
    'pending',
    'uploading',
    'ready',
    'error',
    'processing',
    'deleted'
);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    is_private BOOLEAN DEFAULT true,
    state state DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    parent_folder UUID
);

CREATE TABLE folders (
    id UUID PRIMARY KEY REFERENCES resources(id) ON DELETE CASCADE
);

-- parent_folder foreign key after creating folders table
ALTER TABLE resources
ADD CONSTRAINT fk_parent_folder FOREIGN KEY (parent_folder) REFERENCES folders(id) ON DELETE CASCADE;

CREATE TABLE files (
    id UUID PRIMARY KEY REFERENCES resources(id) ON DELETE CASCADE,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    storage_path VARCHAR(500) NOT NULL,
    checksum VARCHAR(64),
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