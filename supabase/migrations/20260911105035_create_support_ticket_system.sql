/*
# Create support_tickets table and admin configuration

## Summary
Replaces the previous support_requests table with a complete support ticket
system. Adds an admin configuration table to restrict dashboard access to a
single configured administrator email, plus a SECURITY DEFINER function for
safe status updates that validates the caller and the new status value.

## 1. New Tables

### support_tickets
- `id` (uuid, primary key, auto-generated)
- `reference` (text, unique, not null) — PALS-YYYYMMDD-XXXX format
- `name` (text, not null) — submitter's full name
- `email` (text, not null) — submitter's email address
- `store_url` (text, not null) — Shopify store URL
- `theme_name` (text, default 'PALS') — theme name, prefilled
- `subject` (text) — optional subject line
- `description` (text, not null) — the full issue description
- `status` (text, not null, default 'new') — one of: new, in_progress, waiting_for_merchant, resolved, closed
- `attachment_path` (text, nullable) — storage path in support-attachments bucket
- `notification_status` (text, default 'pending') — admin email delivery state
- `autoresponder_status` (text, default 'pending') — merchant email delivery state
- `notification_error` (text, nullable) — error message if admin email failed
- `autoresponder_error` (text, nullable) — error message if merchant email failed
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### admin_config
- `id` (int, primary key, always 1 — singleton)
- `admin_email` (text, not null) — the email address allowed to access the admin dashboard

## 2. Constraints
- `support_tickets_status_check`: status must be one of new, in_progress, waiting_for_merchant, resolved, closed
- `admin_config_singleton`: only one row (id = 1)

## 3. Triggers
- `support_tickets_set_updated_at`: automatically sets updated_at to now() on every UPDATE

## 4. Indexes
- `support_tickets_reference_idx` on reference
- `support_tickets_email_idx` on email
- `support_tickets_status_idx` on status
- `support_tickets_created_at_idx` on created_at DESC

## 5. Security (RLS)
- support_tickets: NO access for anon. Only authenticated users who match the
  configured admin_email can SELECT or UPDATE. No INSERT, DELETE for anyone
  through the data API — ticket creation happens only through the edge function
  using the service role key.
- admin_config: only authenticated admin can SELECT.

## 6. Functions
- `update_ticket_status(p_ticket_id uuid, p_status text)`: SECURITY DEFINER
  function that validates the caller is the configured admin, validates the
  status value, and updates the ticket. Revoked from anon.

## 7. Important Notes
- The previous support_requests table is NOT dropped (data safety). It remains
  in the database but is no longer used.
- Ticket INSERT is not allowed through RLS at all — the edge function uses the
  service role key which bypasses RLS. This ensures all validation happens
  server-side.
- The admin_email in admin_config must be set to the actual admin's email.
  Until it is set, no one can access the dashboard.
*/

-- ============================================================
-- admin_config table (singleton) — created first so policies can reference it
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_email text NOT NULL
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- support_tickets table
-- ============================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  store_url text NOT NULL,
  theme_name text NOT NULL DEFAULT 'PALS',
  subject text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  attachment_path text,
  notification_status text NOT NULL DEFAULT 'pending',
  autoresponder_status text NOT NULL DEFAULT 'pending',
  notification_error text,
  autoresponder_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add status constraint if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_status_check'
  ) THEN
    ALTER TABLE support_tickets
    ADD CONSTRAINT support_tickets_status_check CHECK (
      status IN ('new', 'in_progress', 'waiting_for_merchant', 'resolved', 'closed')
    );
  END IF;
END $$;

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Revoke all from anon
REVOKE SELECT, INSERT, UPDATE, DELETE ON support_tickets FROM anon;

-- ============================================================
-- RLS Policies for admin_config
-- ============================================================

DROP POLICY IF EXISTS "admin_read_config" ON admin_config;
CREATE POLICY "admin_read_config"
  ON admin_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = admin_config.admin_email
    )
  );

-- ============================================================
-- RLS Policies for support_tickets
-- Only the configured admin (matched by email) can SELECT and UPDATE.
-- No INSERT or DELETE through the data API.
-- ============================================================

DROP POLICY IF EXISTS "admin_select_tickets" ON support_tickets;
CREATE POLICY "admin_select_tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_config
      WHERE admin_config.id = 1
      AND admin_config.admin_email = (
        SELECT email FROM auth.users WHERE auth.users.id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "admin_update_tickets" ON support_tickets;
CREATE POLICY "admin_update_tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_config
      WHERE admin_config.id = 1
      AND admin_config.admin_email = (
        SELECT email FROM auth.users WHERE auth.users.id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_config
      WHERE admin_config.id = 1
      AND admin_config.admin_email = (
        SELECT email FROM auth.users WHERE auth.users.id = auth.uid()
      )
    )
  );

-- ============================================================
-- updated_at trigger function and trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_tickets_set_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_set_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- update_ticket_status SECURITY DEFINER function
-- ============================================================

CREATE OR REPLACE FUNCTION update_ticket_status(p_ticket_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_email text;
  v_caller_email text;
BEGIN
  SELECT admin_email INTO v_admin_email FROM admin_config WHERE id = 1;
  IF v_admin_email IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT email INTO v_caller_email FROM auth.users WHERE id = auth.uid();
  IF v_caller_email IS NULL OR v_caller_email != v_admin_email THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_status NOT IN ('new', 'in_progress', 'waiting_for_merchant', 'resolved', 'closed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE support_tickets
  SET status = p_status
  WHERE id = p_ticket_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket not found';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_ticket_status FROM anon;
GRANT EXECUTE ON FUNCTION update_ticket_status TO authenticated;

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS support_tickets_reference_idx ON support_tickets (reference);
CREATE INDEX IF NOT EXISTS support_tickets_email_idx ON support_tickets (email);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets (status);
CREATE INDEX IF NOT EXISTS support_tickets_created_at_idx ON support_tickets (created_at DESC);