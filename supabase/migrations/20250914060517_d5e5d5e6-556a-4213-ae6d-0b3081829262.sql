-- Allow public read access to service names for redirect pages
CREATE POLICY "Public can view service names for redirects" 
ON public.services 
FOR SELECT 
USING (true);