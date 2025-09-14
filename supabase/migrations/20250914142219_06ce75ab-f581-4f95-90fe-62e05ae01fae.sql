-- Fix Critical RLS Issues: Create public read policies for episodes and services

-- Drop existing conflicting policies for episodes
DROP POLICY IF EXISTS "Users can view their own episodes" ON public.episodes;

-- Create new episode policies: owners can do everything, public can read LIVE episodes
CREATE POLICY "Users can manage their own episodes" 
ON public.episodes 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view live episodes" 
ON public.episodes 
FOR SELECT 
USING (status = 'LIVE');

-- Drop existing conflicting policies for services  
DROP POLICY IF EXISTS "Users can view their own services" ON public.services;

-- Create new service policies: owners can do everything, public can read all services
CREATE POLICY "Users can manage their own services"
ON public.services
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Public can read all services"
ON public.services  
FOR SELECT
USING (true);

-- Clean up user_platforms policies - these should remain private
-- No changes needed for user_platforms as they should stay private

-- Clean up clicks policies - remove redundant ones
DROP POLICY IF EXISTS "anon_can_insert_clicks" ON public.clicks;
DROP POLICY IF EXISTS "service_role_can_insert_clicks" ON public.clicks;
DROP POLICY IF EXISTS "Service role can insert clicks" ON public.clicks;

-- Keep only the essential click policies
-- "Anyone can insert clicks" - already exists and is correct
-- "Users can view clicks for their services" - already exists and is correct