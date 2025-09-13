-- Create enums for the application
CREATE TYPE public.app_platform AS ENUM ('NOTE', 'YOUTUBE', 'SPOTIFY', 'INSTAGRAM', 'CUSTOM');
CREATE TYPE public.fallback_behavior AS ENUM ('COMING_SOON', 'FALLBACK_TO_CHANNEL');
CREATE TYPE public.episode_status AS ENUM ('DRAFT', 'LIVE', 'ARCHIVED');

-- Create allowed_admins table for admin access control
CREATE TABLE public.allowed_admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on allowed_admins
ALTER TABLE public.allowed_admins ENABLE ROW LEVEL SECURITY;

-- Create policy for allowed_admins - only admins can manage
CREATE POLICY "Admin emails can be managed by admins only" 
ON public.allowed_admins 
FOR ALL 
USING (auth.email() IN (SELECT email FROM public.allowed_admins));

-- Insert initial admin email
INSERT INTO public.allowed_admins (email) VALUES ('admin@dispatt.ch');

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.email() IN (SELECT email FROM public.allowed_admins);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  default_platform public.app_platform NOT NULL,
  note_home_url TEXT,
  youtube_channel_url TEXT,
  spotify_show_url TEXT,
  instagram_profile_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-zA-Z0-9-]+$' AND LENGTH(slug) BETWEEN 1 AND 32),
  CONSTRAINT valid_name_length CHECK (LENGTH(name) BETWEEN 1 AND 50),
  CONSTRAINT valid_note_url CHECK (note_home_url IS NULL OR note_home_url ~ '^https://'),
  CONSTRAINT valid_youtube_url CHECK (youtube_channel_url IS NULL OR youtube_channel_url ~ '^https://'),
  CONSTRAINT valid_spotify_url CHECK (spotify_show_url IS NULL OR spotify_show_url ~ '^https://'),
  CONSTRAINT valid_instagram_url CHECK (instagram_profile_url IS NULL OR instagram_profile_url ~ '^https://')
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services
CREATE POLICY "Admins can manage services" 
ON public.services 
FOR ALL 
USING (public.is_admin());

-- Create episodes table
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  ep_no INTEGER NOT NULL,
  title TEXT,
  default_platform public.app_platform NOT NULL,
  note_url TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  instagram_url TEXT,
  custom_url TEXT,
  fallback_behavior public.fallback_behavior NOT NULL DEFAULT 'FALLBACK_TO_CHANNEL',
  status public.episode_status NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(service_id, ep_no),
  CONSTRAINT positive_ep_no CHECK (ep_no > 0),
  CONSTRAINT valid_title_length CHECK (title IS NULL OR LENGTH(title) BETWEEN 1 AND 100),
  CONSTRAINT valid_note_url CHECK (note_url IS NULL OR note_url ~ '^https://'),
  CONSTRAINT valid_youtube_url CHECK (youtube_url IS NULL OR youtube_url ~ '^https://'),
  CONSTRAINT valid_spotify_url CHECK (spotify_url IS NULL OR spotify_url ~ '^https://'),
  CONSTRAINT valid_instagram_url CHECK (instagram_url IS NULL OR instagram_url ~ '^https://'),
  CONSTRAINT valid_custom_url CHECK (custom_url IS NULL OR custom_url ~ '^https://')
);

-- Enable RLS on episodes
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Create policies for episodes
CREATE POLICY "Admins can manage episodes" 
ON public.episodes 
FOR ALL 
USING (public.is_admin());

-- Create clicks table for analytics
CREATE TABLE public.clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  ep_no INTEGER,
  variant TEXT NOT NULL,
  referrer TEXT,
  referer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  ip_hash TEXT,
  host TEXT,
  path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clicks
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- Create policies for clicks
CREATE POLICY "Admins can view clicks" 
ON public.clicks 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Anyone can insert clicks" 
ON public.clicks 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_clicks_service_ep_variant_time ON public.clicks (service_id, ep_no, variant, created_at);
CREATE INDEX idx_clicks_created_at ON public.clicks (created_at);
CREATE INDEX idx_clicks_referer_domain ON public.clicks (referer_domain) WHERE referer_domain IS NOT NULL;
CREATE INDEX idx_episodes_service_ep ON public.episodes (service_id, ep_no);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();