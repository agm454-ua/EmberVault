
-- To check children of a parent folder
CREATE INDEX idx_resources_parent_folder ON resources(parent_folder);

-- To check items that are not deleted
CREATE INDEX idx_resources_not_deleted ON resources(deleted_at) WHERE deleted_at IS NULL;

-- To optimize file search by name
CREATE INDEX idx_resources_parent_name ON resources(parent_folder, name);

-- To optimize system role lookup from the user table
CREATE INDEX idx_users_system_role ON users(system_role);

-- To optimize joins between system roles and permissions
CREATE INDEX idx_system_role_permissions_role ON system_role_permissions(role_id);

-- To optimize joins between resource roles and their permissions
CREATE INDEX idx_resource_role_permissions_role ON resource_role_permissions(role_id);

-- To optimize searching for a specific permission in a specific user
CREATE INDEX idx_urr_user_resource ON user_is_resource_role_for_resource(user_id, resource_id);
