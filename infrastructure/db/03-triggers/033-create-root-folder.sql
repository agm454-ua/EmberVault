-- This trigger creates the root folder when creating a user

CREATE OR REPLACE FUNCTION create_user_root_folder() RETURNS TRIGGER AS $create_user_root_folder$
DECLARE
    resource_id UUID;
BEGIN
    -- First create the resource
    INSERT INTO resources (name, state)
    VALUES (NEW.username || '_root', 'ready')
    RETURNING id INTO resource_id;

    -- Then create the folder
    INSERT INTO folders (id) VALUES (resource_id);

    -- Assign root folder to user
    NEW.root_folder = resource_id;

    RETURN NEW;
END;
$create_user_root_folder$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_user_root_folder BEFORE INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_user_root_folder();

-- This trigger assigns the user as owner of their root folder when creating a user
CREATE OR REPLACE FUNCTION assign_user_root_folder_owner() RETURNS TRIGGER AS $assign_user_root_folder_owner$
DECLARE
    owner_role_id UUID;
BEGIN
    SELECT id INTO owner_role_id
    FROM resource_roles
    WHERE name = 'owner';

    IF owner_role_id IS NULL THEN
        RAISE EXCEPTION 'Owner role does not exist. Run RBAC seed before creating users.';
    END IF;

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (NEW.id, owner_role_id, NEW.root_folder);

    RETURN NEW;
END;
$assign_user_root_folder_owner$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_user_root_folder_owner AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION assign_user_root_folder_owner();