-- This trigger creates the root folder when creating a user

CREATE OR REPLACE FUNCTION create_user_root_folder() RETURNS TRIGGER AS $create_user_root_folder$
DECLARE
    resource_id UUID;
BEGIN
    -- First create the resource
    INSERT INTO resources (name)
    VALUES (NEW.username || '_root')
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