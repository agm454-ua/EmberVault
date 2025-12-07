-- This trigger updates automatically this 'updated_at' field
-- in the resources table
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $set_updated_at$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$set_updated_at$ LANGUAGE plpgsql;


CREATE TRIGGER trg_auto_update_updated_at BEFORE INSERT OR UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION set_updated_at();