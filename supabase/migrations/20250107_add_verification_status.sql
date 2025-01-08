-- Add verification_status column to users table
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS verification_status TEXT 
CHECK (verification_status IN ('pending', 'verified', 'rejected'))
DEFAULT 'pending';

-- Create storage bucket for verification documents if it doesn't exist
INSERT INTO storage.buckets (id, name)
SELECT 'verification-documents', 'verification-documents'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'verification-documents'
);

-- Set up storage policies for verification documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'verification-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'verification-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
