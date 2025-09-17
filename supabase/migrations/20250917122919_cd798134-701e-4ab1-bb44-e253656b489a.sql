-- Remove default_platform and default_platform_id columns from episodes table
-- These settings will only be maintained at the service level

ALTER TABLE public.episodes 
DROP COLUMN IF EXISTS default_platform,
DROP COLUMN IF EXISTS default_platform_id;