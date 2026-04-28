
CREATE TABLE system_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
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


CREATE TABLE resource_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
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

