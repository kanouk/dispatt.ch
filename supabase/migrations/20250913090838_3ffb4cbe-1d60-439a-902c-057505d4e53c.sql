-- Fix security issue: Replace overly permissive episodes policy with secure admin-only access

-- Drop the current overly permissive policy for episodes
DROP POLICY IF EXISTS "Admins can manage episodes" ON public.episodes;

-- Create secure admin-only policies for episodes table
-- Policy for SELECT: Only authenticated admin users can read episodes
CREATE POLICY "authenticated_admins_can_select_episodes" 
ON public.episodes 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() IS NOT NULL AND is_admin()
);

-- Policy for INSERT: Only authenticated admin users can create episodes  
CREATE POLICY "authenticated_admins_can_insert_episodes" 
ON public.episodes 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL AND is_admin()
);

-- Policy for UPDATE: Only authenticated admin users can update episodes
CREATE POLICY "authenticated_admins_can_update_episodes" 
ON public.episodes 
FOR UPDATE 
TO authenticated 
USING (
  auth.uid() IS NOT NULL AND is_admin()
) 
WITH CHECK (
  auth.uid() IS NOT NULL AND is_admin()
);

-- Policy for DELETE: Only authenticated admin users can delete episodes
CREATE POLICY "authenticated_admins_can_delete_episodes" 
ON public.episodes 
FOR DELETE 
TO authenticated 
USING (
  auth.uid() IS NOT NULL AND is_admin()
);

-- Also fix the services table with the same approach for consistency
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

-- Create secure admin-only policies for services table
CREATE POLICY "authenticated_admins_can_select_services" 
ON public.services 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() IS NOT NULL AND is_admin()
);

CREATE POLICY "authenticated_admins_can_insert_services" 
ON public.services 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL AND is_admin()
);

CREATE POLICY "authenticated_admins_can_update_services" 
ON public.services 
FOR UPDATE 
TO authenticated 
USING (
  auth.uid() IS NOT NULL AND is_admin()
) 
WITH CHECK (
  auth.uid() IS NOT NULL AND is_admin()
);

CREATE POLICY "authenticated_admins_can_delete_services" 
ON public.services 
FOR DELETE 
TO authenticated 
USING (
  auth.uid() IS NOT NULL AND is_admin()
);