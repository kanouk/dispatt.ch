-- Add explicit deny policy for public SELECT access on clicks table
-- This ensures anonymous users cannot read analytics data
CREATE POLICY "deny_public_select_clicks" 
ON public.clicks 
FOR SELECT 
TO anon
USING (false);

-- Add explicit deny policy for authenticated non-admin users
CREATE POLICY "deny_non_admin_select_clicks" 
ON public.clicks 
FOR SELECT 
TO authenticated
USING (false);