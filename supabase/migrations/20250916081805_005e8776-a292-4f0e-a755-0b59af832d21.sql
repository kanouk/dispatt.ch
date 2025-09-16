-- Fix critical security bug: Remove overly permissive RLS policies that allow users to see other users' data

-- Remove the public SELECT policy from services table
DROP POLICY IF EXISTS "Public can view service basic info for redirects" ON public.services;

-- Remove the public SELECT policy from episodes table  
DROP POLICY IF EXISTS "Public can view live episode basic info for redirects" ON public.episodes;

-- Add explicit SELECT policies for users to view their own data (for clarity)
CREATE POLICY "Users can view their own services" ON public.services
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own episodes" ON public.episodes  
FOR SELECT USING (auth.uid() = user_id);