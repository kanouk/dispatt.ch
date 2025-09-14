-- Update existing user platform icons from emojis to React Icons names
UPDATE user_platforms 
SET platform_icon = CASE 
  WHEN platform_icon = '🎥' OR platform_slug = 'youtube' THEN 'FaYoutube'
  WHEN platform_icon = '📝' OR platform_slug = 'note' THEN 'FaStickyNote'
  WHEN platform_icon = '🎵' OR platform_slug = 'tiktok' THEN 'FaTiktok'
  WHEN platform_icon = '📷' OR platform_slug = 'instagram' THEN 'FaInstagram'
  WHEN platform_icon = '🎧' OR platform_slug = 'spotify' THEN 'FaSpotify'
  ELSE platform_icon
END
WHERE platform_icon IN ('🎥', '📝', '🎵', '📷', '🎧') 
   OR platform_slug IN ('youtube', 'note', 'tiktok', 'instagram', 'spotify');