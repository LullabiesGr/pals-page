/*
# Fix security advisor warnings

1. Add SET search_path to set_updated_at trigger function
2. Re-assert REVOKE EXECUTE on update_ticket_status from anon
3. Revoke anon privileges on admin_config (RLS already blocks, but grants should be minimal)
4. Tighten old support_requests table: revoke anon access (replaced by support_tickets)
*/

-- Fix 1: set_updated_at search_path
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix 2: Re-assert revocation on update_ticket_status
REVOKE EXECUTE ON FUNCTION update_ticket_status FROM anon;
REVOKE EXECUTE ON FUNCTION update_ticket_status FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_ticket_status TO authenticated;

-- Fix 3: Revoke anon on admin_config
REVOKE SELECT, INSERT, UPDATE, DELETE ON admin_config FROM anon;

-- Fix 4: Revoke anon on support_requests (old table, no longer used)
REVOKE SELECT, INSERT, UPDATE, DELETE ON support_requests FROM anon;
DROP POLICY IF EXISTS "anon_insert_support_requests" ON support_requests;