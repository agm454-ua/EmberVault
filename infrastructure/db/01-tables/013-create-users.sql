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

-- Relation between users, roles and resources
CREATE TABLE user_is_resource_role_for_resource (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_role UUID REFERENCES resource_roles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, resource_role, resource_id)
);