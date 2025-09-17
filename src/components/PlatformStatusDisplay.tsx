import { Episode, UserPlatform } from "@/types/database";
import { PlatformIcon } from "@/components/ui/platform-icon";

interface PlatformStatusDisplayProps {
  episode: Episode;
  userPlatforms: UserPlatform[];
}

export const PlatformStatusDisplay = ({ episode, userPlatforms }: PlatformStatusDisplayProps) => {
  const enabledPlatforms = userPlatforms
    .filter(p => p.is_enabled)
    .sort((a, b) => a.display_order - b.display_order);

  const hasUrl = (platform: UserPlatform): boolean => {
    const slug = platform.platform_slug;
    
    // Check new format (platform_urls JSONB)
    if (episode.platform_urls && episode.platform_urls[slug]) {
      return true;
    }
    
    // Check old format (individual URL fields)
    switch (slug) {
      case 'note':
        return !!episode.note_url;
      case 'youtube':
        return !!episode.youtube_url;
      case 'spotify':
        return !!episode.spotify_url;
      case 'instagram':
        return !!episode.instagram_url;
      case 'applepodcasts':
        return !!episode.apple_podcasts_url;
      default:
        return !!episode.custom_url;
    }
  };

  return (
    <div className="flex gap-1">
      {enabledPlatforms.map((platform) => {
        const isRegistered = hasUrl(platform);
        return (
          <div
            key={platform.id}
            className={`${isRegistered ? '' : 'text-muted-foreground'}`}
            title={`${platform.platform_name}: ${isRegistered ? 'URL登録済み' : 'URL未登録'}`}
          >
            <PlatformIcon
              iconName={platform.platform_icon || 'FaGlobe'}
              className="h-4 w-4"
              color={isRegistered ? platform.platform_color : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};