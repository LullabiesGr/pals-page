/*
# Set default admin email
Inserts the default admin configuration row. The admin_email is set to
admin@pals-theme.com as a placeholder. This must be updated to the actual
administrator's email address. The admin must then create a Supabase auth
account using that same email to access the /admin/support dashboard.
*/

INSERT INTO admin_config (id, admin_email)
VALUES (1, 'admin@pals-theme.com')
ON CONFLICT (id) DO NOTHING;