-- Fix security warning: Set search_path for the helper function
CREATE OR REPLACE FUNCTION get_default_platform_id(user_uuid UUID, platform_enum app_platform)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT id FROM user_platforms 
    WHERE user_id = user_uuid 
    AND platform_slug = CASE platform_enum
      WHEN 'NOTE' THEN 'note'
      WHEN 'YOUTUBE' THEN 'youtube' 
      WHEN 'SPOTIFY' THEN 'spotify'
      WHEN 'INSTAGRAM' THEN 'instagram'
      WHEN 'TIKTOK' THEN 'tiktok'
      WHEN 'APPLEPODCASTS' THEN 'applepodcasts'
      ELSE 'note' -- fallback to note
    END
    LIMIT 1
  );
END;
$$;

-- Update episodes to set default_platform_id based on existing default_platform
UPDATE episodes 
SET default_platform_id = get_default_platform_id(user_id, default_platform)
WHERE default_platform_id IS NULL;

-- Update services to set default_platform_id based on existing default_platform  
UPDATE services
SET default_platform_id = get_default_platform_id(user_id, default_platform)
WHERE default_platform_id IS NULL;