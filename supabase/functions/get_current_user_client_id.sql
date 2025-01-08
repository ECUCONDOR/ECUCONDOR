-- This function returns the current client_id for the authenticated user
CREATE OR REPLACE FUNCTION get_current_user_client_id()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_client_id bigint;
BEGIN
    -- Get the client_id from user_client_relation for the current user
    SELECT client_id INTO v_client_id
    FROM user_client_relation
    WHERE user_id = auth.uid()
    ORDER BY created_at DESC
    LIMIT 1;

    -- Return the found client_id or null if not found
    RETURN v_client_id;
END;
$$;
