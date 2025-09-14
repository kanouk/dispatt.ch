-- Create function to insert default platforms for a user
CREATE OR REPLACE FUNCTION public.create_default_user_platforms(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  platform_count INTEGER;
BEGIN
  -- Check if user already has platforms
  SELECT COUNT(*) INTO platform_count
  FROM user_platforms
  WHERE user_id = target_user_id;
  
  -- Only insert defaults if user has no platforms
  IF platform_count = 0 THEN
    INSERT INTO user_platforms (user_id, platform_name, platform_slug, platform_icon, platform_color, url_template, display_order, is_enabled) VALUES
    (target_user_id, 'YouTube', 'youtube', '🎥', '#FF0000', 'https://youtube.com/@{username}', 1, true),
    (target_user_id, 'note', 'note', '📝', '#41C9B4', 'https://note.com/{username}', 2, true),
    (target_user_id, 'TikTok', 'tiktok', '🎵', '#000000', 'https://tiktok.com/@{username}', 3, true),
    (target_user_id, 'Instagram', 'instagram', '📷', '#E4405F', 'https://instagram.com/{username}', 4, true),
    (target_user_id, 'Spotify', 'spotify', '🎧', '#1DB954', 'https://open.spotify.com/show/{show_id}', 5, true);
  END IF;
END;
$$;