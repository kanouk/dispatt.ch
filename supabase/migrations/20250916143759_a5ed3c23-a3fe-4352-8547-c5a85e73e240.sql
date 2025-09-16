-- Phase 1: Add new JSONB columns and default_platform_id to episodes table
ALTER TABLE episodes 
ADD COLUMN platform_urls JSONB DEFAULT '{}'::jsonb,
ADD COLUMN default_platform_id UUID REFERENCES user_platforms(id);

-- Migrate existing episode URLs to JSONB format
UPDATE episodes 
SET platform_urls = (
  SELECT jsonb_object_agg(
    CASE 
      WHEN field = 'note_url' THEN 'note'
      WHEN field = 'youtube_url' THEN 'youtube' 
      WHEN field = 'spotify_url' THEN 'spotify'
      WHEN field = 'instagram_url' THEN 'instagram'
      WHEN field = 'apple_podcasts_url' THEN 'applepodcasts'
      WHEN field = 'custom_url' THEN 'custom'
    END,
    value
  )
  FROM (
    VALUES 
      ('note_url', note_url),
      ('youtube_url', youtube_url),
      ('spotify_url', spotify_url), 
      ('instagram_url', instagram_url),
      ('apple_podcasts_url', apple_podcasts_url),
      ('custom_url', custom_url)
  ) AS t(field, value)
  WHERE value IS NOT NULL AND value != ''
);

-- Phase 2: Add new JSONB columns to services table  
ALTER TABLE services
ADD COLUMN platform_urls JSONB DEFAULT '{}'::jsonb,
ADD COLUMN default_platform_id UUID REFERENCES user_platforms(id);

-- Migrate existing service URLs to JSONB format
UPDATE services
SET platform_urls = (
  SELECT jsonb_object_agg(
    CASE 
      WHEN field = 'note_home_url' THEN 'note'
      WHEN field = 'youtube_channel_url' THEN 'youtube'
      WHEN field = 'spotify_show_url' THEN 'spotify' 
      WHEN field = 'instagram_profile_url' THEN 'instagram'
      WHEN field = 'tiktok_profile_url' THEN 'tiktok'
      WHEN field = 'apple_podcasts_url' THEN 'applepodcasts'
    END,
    value
  )
  FROM (
    VALUES
      ('note_home_url', note_home_url),
      ('youtube_channel_url', youtube_channel_url),
      ('spotify_show_url', spotify_show_url),
      ('instagram_profile_url', instagram_profile_url), 
      ('tiktok_profile_url', tiktok_profile_url),
      ('apple_podcasts_url', apple_podcasts_url)
  ) AS t(field, value)
  WHERE value IS NOT NULL AND value != ''
);

-- Create helper function to map legacy platform enum to user_platform slug
CREATE OR REPLACE FUNCTION get_default_platform_id(user_uuid UUID, platform_enum app_platform)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;