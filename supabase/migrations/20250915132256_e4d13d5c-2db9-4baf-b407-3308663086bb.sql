-- Add Apple Podcasts support to the database

-- Add APPLEPODCASTS to the app_platform enum
ALTER TYPE app_platform ADD VALUE IF NOT EXISTS 'APPLEPODCASTS';

-- Add apple_podcasts_url column to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS apple_podcasts_url TEXT;

-- Add apple_podcasts_url column to episodes table  
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS apple_podcasts_url TEXT;

-- Update create_default_user_platforms function to include Apple Podcasts
CREATE OR REPLACE FUNCTION public.create_default_user_platforms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create defaults if user has no platforms
  IF NOT EXISTS (SELECT 1 FROM user_platforms WHERE user_id = auth.uid()) THEN
    INSERT INTO user_platforms (user_id, platform_name, platform_slug, platform_icon, platform_color, url_template, is_enabled, display_order)
    VALUES
      (auth.uid(), 'YouTube', 'youtube', 'FaYoutube', '#FF0000', 'https://youtube.com/@{username}', true, 0),
      (auth.uid(), 'note', 'note', 'FaStickyNote', '#41C9B4', 'https://note.com/{username}', true, 1),
      (auth.uid(), 'TikTok', 'tiktok', 'FaTiktok', '#000000', 'https://tiktok.com/@{username}', true, 2),
      (auth.uid(), 'Instagram', 'instagram', 'FaInstagram', '#E4405F', 'https://instagram.com/{username}', true, 3),
      (auth.uid(), 'Spotify', 'spotify', 'FaSpotify', '#1DB954', 'https://open.spotify.com/show/{show_id}', true, 4),
      (auth.uid(), 'Apple Podcasts', 'applepodcasts', 'SiApplepodcasts', '#9933CC', 'https://podcasts.apple.com/podcast/id{podcast_id}', true, 5);
  END IF;
END;
$function$;