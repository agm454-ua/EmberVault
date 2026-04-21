-- This trigger updates the user's storage_used_gb when a file is inserted, updated (size changed) or deleted.

CREATE OR REPLACE FUNCTION update_user_storage_used_gb_from_file_change()
RETURNS TRIGGER AS $$
DECLARE
    v_resource_id UUID;
    v_owner_user_id UUID;
    v_delta_bytes NUMERIC;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_resource_id := NEW.id;
        v_delta_bytes := COALESCE(NEW.size_bytes, 0);
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only react when size actually changes.
        IF NEW.size_bytes IS NOT DISTINCT FROM OLD.size_bytes THEN
            RETURN NEW;
        END IF;

        v_resource_id := NEW.id;
        v_delta_bytes := COALESCE(NEW.size_bytes, 0) - COALESCE(OLD.size_bytes, 0);
    ELSIF TG_OP = 'DELETE' THEN
        v_resource_id := OLD.id;
        v_delta_bytes := -COALESCE(OLD.size_bytes, 0);
    END IF;

    -- Find owner user for this resource.
    SELECT urr.user_id
    INTO v_owner_user_id
    FROM user_is_resource_role_for_resource urr
    JOIN resource_roles rr ON rr.id = urr.resource_role
    WHERE urr.resource_id = v_resource_id
      AND rr.name = 'owner'
    LIMIT 1;

    IF v_owner_user_id IS NOT NULL AND v_delta_bytes <> 0 THEN
        UPDATE users
        SET storage_used_gb = GREATEST(
            0,
            ROUND(
                COALESCE(storage_used_gb, 0)
                + (v_delta_bytes / 1073741824.0), -- 1024^3 bytes
                2
            )
        )
        WHERE id = v_owner_user_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_user_storage_used_on_files_insert
AFTER INSERT ON files
FOR EACH ROW
EXECUTE FUNCTION update_user_storage_used_gb_from_file_change();

CREATE OR REPLACE TRIGGER trg_update_user_storage_used_on_files_update
AFTER UPDATE OF size_bytes ON files
FOR EACH ROW
EXECUTE FUNCTION update_user_storage_used_gb_from_file_change();

CREATE OR REPLACE TRIGGER trg_update_user_storage_used_on_files_delete
AFTER DELETE ON files
FOR EACH ROW
EXECUTE FUNCTION update_user_storage_used_gb_from_file_change();