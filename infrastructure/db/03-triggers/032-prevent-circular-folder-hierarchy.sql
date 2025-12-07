-- This trigger is used to prevent folders to form a circular hierarchy

CREATE OR REPLACE FUNCTION prevent_folder_cycles() RETURNS trigger AS $prevent_folder_cycles$
DECLARE
    current UUID;
    new_parent UUID;
BEGIN
    -- Get the parent_folder from resources table
    SELECT parent_folder INTO new_parent
    FROM resources
    WHERE id = NEW.id;

    current := new_parent;

    WHILE current IS NOT NULL LOOP
        IF current = NEW.id THEN
            RAISE EXCEPTION 'Cannot create circular folder hierarchy';
        END IF;

        SELECT parent_folder INTO current
        FROM resources
        WHERE id = current;
    END LOOP;

    RETURN NEW;
END;
$prevent_folder_cycles$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_folder_cycles BEFORE INSERT OR UPDATE ON folders
FOR EACH ROW
EXECUTE FUNCTION prevent_folder_cycles();
