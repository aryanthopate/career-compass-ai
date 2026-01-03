-- Create contacts table for storing contact form submissions
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit a contact form (public insert)
CREATE POLICY "Anyone can submit contact form"
ON public.contacts
FOR INSERT
WITH CHECK (true);

-- Policy: Only admins can view contacts
CREATE POLICY "Admins can view all contacts"
ON public.contacts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Policy: Only admins can update contacts (mark as read)
CREATE POLICY "Admins can update contacts"
ON public.contacts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Policy: Only admins can delete contacts
CREATE POLICY "Admins can delete contacts"
ON public.contacts
FOR DELETE
USING (has_role(auth.uid(), 'admin'));