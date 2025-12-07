-- System permissions
INSERT INTO system_permissions (name)
VALUES 
    ('manage_users'),       -- Global permission to modify accounts
    ('manage_resources'),   -- Global permission to modify resources
    ('access_admin_panel'),
    ('create_user'),
    ('suspend_user'),
    ('assign_roles');



-- System roles
INSERT INTO system_roles (name, description)
VALUES 
    ('admin', 'Administrator role'),
    ('user', 'Standard user');


-- Admin permissions
INSERT INTO system_role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM system_roles r, system_permissions p
WHERE r.name='admin';



-- Resource permissions
INSERT INTO resource_permissions (name)
VALUES
    ('read'),
    ('write'),
    ('share'),
    ('download');


-- Resource roles
INSERT INTO resource_roles (name, description)
VALUES
    ('owner', 'Full control of the resource'),
    ('editor', 'Can modify content but not manage ownership'),
    ('guest', 'Read-only access');


-- Owner: all permissions over a resource
INSERT INTO resource_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM resource_roles r, resource_permissions p
WHERE r.name='owner';

-- Editor: read, write, download
INSERT INTO resource_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM resource_roles r, resource_permissions p
WHERE r.name='editor'
  AND p.name IN ('read','write', 'download');

-- Guest: read, download
INSERT INTO resource_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM resource_roles r, resource_permissions p
WHERE r.name='guest'
  AND p.name IN ('read','download');
