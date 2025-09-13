-- Add tiktok_profile_url column to services table
ALTER TABLE public.services 
ADD COLUMN tiktok_profile_url text;