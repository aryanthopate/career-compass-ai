-- Add share_token column for public resume sharing
ALTER TABLE public.resumes
ADD COLUMN share_token uuid UNIQUE DEFAULT NULL;

-- Create index for fast token lookup
CREATE INDEX idx_resumes_share_token ON public.resumes (share_token) WHERE share_token IS NOT NULL;

-- Allow anyone to view a specific resume if they have the share_token
CREATE POLICY "Anyone can view shared resumes by token"
ON public.resumes
FOR SELECT
USING (share_token IS NOT NULL);