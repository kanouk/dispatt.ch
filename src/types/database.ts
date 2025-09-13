export type AppPlatform = 'NOTE' | 'YOUTUBE' | 'SPOTIFY' | 'INSTAGRAM' | 'TIKTOK' | 'CUSTOM';
export type FallbackBehavior = 'COMING_SOON' | 'FALLBACK_TO_CHANNEL';
export type EpisodeStatus = 'DRAFT' | 'LIVE' | 'ARCHIVED';

export interface Service {
  id: string;
  slug: string;
  name: string;
  default_platform: AppPlatform;
  note_home_url?: string;
  youtube_channel_url?: string;
  spotify_show_url?: string;
  instagram_profile_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  service_id: string;
  ep_no: number;
  title?: string;
  default_platform: AppPlatform;
  note_url?: string;
  youtube_url?: string;
  spotify_url?: string;
  instagram_url?: string;
  custom_url?: string;
  fallback_behavior: FallbackBehavior;
  status: EpisodeStatus;
  published_at?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Click {
  id: string;
  service_id: string;
  episode_id?: string;
  ep_no?: number;
  variant: string;
  referrer?: string;
  referer_domain?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  user_agent?: string;
  is_bot: boolean;
  ip_hash?: string;
  host?: string;
  path?: string;
  created_at: string;
}