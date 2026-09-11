/*
# Create support-attachments storage bucket and policies

## Summary
Creates a private storage bucket named `support-attachments` for merchant-
submitted file attachments. The bucket is private — no public URLs are
exposed. Files are uploaded by the edge function using the service role key.
Only the authenticated admin can read (download) attachments via signed URLs.

## Bucket
- Name: support-attachments
- Public: false (private)
- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, application/pdf
- Max file size: 5 MB (5,242,880 bytes)

## Policies
- SELECT (read/download): authenticated admin only (matched by admin_config.admin_email)
- INSERT (upload): no public access — uploads happen via the edge function
  with the service role key which bypasses RLS
- UPDATE/DELETE: authenticated admin only

## Important Notes
- Storage filenames are randomized by the edge function — the original
  filename is never used as the storage path.
- Signed URLs are generated on-demand for the admin only, with short expiry.
- The bucket has a 5MB size limit enforced at the storage level.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-attachments',
  'support-attachments',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Admin can read (download) attachments
DROP POLICY IF EXISTS "admin_read_attachments" ON storage.objects;
CREATE POLICY "admin_read_attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'support-attachments'
    AND EXISTS (
      SELECT 1 FROM admin_config
      WHERE admin_config.id = 1
      AND admin_config.admin_email = (
        SELECT email FROM auth.users WHERE auth.users.id = auth.uid()
      )
    )
  );

-- Admin can delete attachments
DROP POLICY IF EXISTS "admin_delete_attachments" ON storage.objects;
CREATE POLICY "admin_delete_attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'support-attachments'
    AND EXISTS (
      SELECT 1 FROM admin_config
      WHERE admin_config.id = 1
      AND admin_config.admin_email = (
        SELECT email FROM auth.users WHERE auth.users.id = auth.uid()
      )
    )
  );

-- No INSERT policy for anon or authenticated on storage.objects for this bucket.
-- Uploads are done by the edge function using the service role key (bypasses RLS).