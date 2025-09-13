-- Strengthen RLS policies for clicks table to prevent any potential data harvesting
-- Drop existing policies to recreate them with enhanced security
DROP POLICY IF EXISTS "Admins can view clicks" ON public.clicks;
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;

-- Recreate SELECT policy with enhanced security - only authenticated admins
CREATE POLICY "authenticated_admins_can_view_clicks" 
ON public.clicks 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND is_admin()
);

-- Recreate INSERT policy - allow anonymous inserts for tracking but restrict to service role
CREATE POLICY "service_role_can_insert_clicks" 
ON public.clicks 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Also allow anon role for edge function inserts (needed for redirect function)
CREATE POLICY "anon_can_insert_clicks" 
ON public.clicks 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Ensure no UPDATE or DELETE operations are allowed (defense in depth)
-- These are already implicitly denied, but being explicit
-- No UPDATE policy means no one can update
-- No DELETE policy means no one can delete

-- Add additional security: Ensure clicks table has proper RLS enabled
ALTER TABLE public.clicks FORCE ROW LEVEL SECURITY;