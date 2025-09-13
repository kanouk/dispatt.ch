-- Migrate from Admin system to User Ownership system

-- First, add user_id columns to existing tables
ALTER TABLE public.services ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.episodes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.clicks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- For existing data, we'll need to set a default user (you can update this manually later)
-- Update services to have the current admin as owner
UPDATE public.services SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Update episodes to match their service owner
UPDATE public.episodes SET user_id = (SELECT user_id FROM public.services WHERE services.id = episodes.service_id) WHERE user_id IS NULL;

-- Make user_id required for services and episodes
ALTER TABLE public.services ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.episodes ALTER COLUMN user_id SET NOT NULL;

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "authenticated_admins_can_select_services" ON public.services;
DROP POLICY IF EXISTS "authenticated_admins_can_insert_services" ON public.services;
DROP POLICY IF EXISTS "authenticated_admins_can_update_services" ON public.services;
DROP POLICY IF EXISTS "authenticated_admins_can_delete_services" ON public.services;

DROP POLICY IF EXISTS "authenticated_admins_can_select_episodes" ON public.episodes;
DROP POLICY IF EXISTS "authenticated_admins_can_insert_episodes" ON public.episodes;
DROP POLICY IF EXISTS "authenticated_admins_can_update_episodes" ON public.episodes;
DROP POLICY IF EXISTS "authenticated_admins_can_delete_episodes" ON public.episodes;

DROP POLICY IF EXISTS "authenticated_admins_can_view_clicks" ON public.clicks;
DROP POLICY IF EXISTS "deny_public_select_clicks" ON public.clicks;
DROP POLICY IF EXISTS "deny_non_admin_select_clicks" ON public.clicks;

-- Create new user-ownership based RLS policies for services
CREATE POLICY "Users can view their own services" ON public.services
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own services" ON public.services
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" ON public.services
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" ON public.services
FOR DELETE USING (auth.uid() = user_id);

-- Create new user-ownership based RLS policies for episodes
CREATE POLICY "Users can view their own episodes" ON public.episodes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own episodes" ON public.episodes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episodes" ON public.episodes
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episodes" ON public.episodes
FOR DELETE USING (auth.uid() = user_id);

-- Create new user-ownership based RLS policies for clicks
CREATE POLICY "Users can view clicks for their services" ON public.clicks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.id = clicks.service_id 
    AND services.user_id = auth.uid()
  )
);

-- Keep anonymous insert for clicks (for tracking)
CREATE POLICY "Anyone can insert clicks" ON public.clicks
FOR INSERT WITH CHECK (true);

-- Keep service role insert for clicks (for edge functions)
CREATE POLICY "Service role can insert clicks" ON public.clicks
FOR INSERT TO service_role WITH CHECK (true);

-- Drop the admin system
DROP FUNCTION IF EXISTS public.is_admin();
DROP TABLE IF EXISTS public.allowed_admins;