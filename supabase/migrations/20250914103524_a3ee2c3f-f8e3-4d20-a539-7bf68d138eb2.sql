-- Update the create_default_user_platforms function to use proper icon identifiers
CREATE OR REPLACE FUNCTION create_default_user_platforms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create defaults if user has no platforms
  IF NOT EXISTS (SELECT 1 FROM user_platforms WHERE user_id = auth.uid()) THEN
    INSERT INTO user_platforms (user_id, platform_name, platform_slug, platform_icon, platform_color, url_template, is_enabled, display_order)
    VALUES
      (auth.uid(), 'YouTube', 'youtube', 'FaYoutube', '#FF0000', 'https://youtube.com/@{username}', true, 0),
      (auth.uid(), 'note', 'note', 'SiNote', '#41C9B4', 'https://note.com/{username}', true, 1),
      (auth.uid(), 'TikTok', 'tiktok', 'FaTiktok', '#000000', 'https://tiktok.com/@{username}', true, 2),
      (auth.uid(), 'Instagram', 'instagram', 'FaInstagram', '#E4405F', 'https://instagram.com/{username}', true, 3),
      (auth.uid(), 'Spotify', 'spotify', 'FaSpotify', '#1DB954', 'https://open.spotify.com/show/{show_id}', true, 4);
  END IF;
END;
$$;