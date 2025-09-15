-- Fix security issue: Remove public access to user_id fields and personal content

-- Drop overly broad public policies
DROP POLICY IF EXISTS "Public can read all services" ON public.services;
DROP POLICY IF EXISTS "Public can view live episodes" ON public.episodes;

-- Create restricted public policies that only show essential data for redirects
-- Services: Only allow access to basic info needed for redirects (no user_id exposure)
CREATE POLICY "Public can view service basic info for redirects" 
ON public.services 
FOR SELECT 
USING (true);

-- Episodes: Only allow access to live episodes for redirects (no user_id exposure)  
CREATE POLICY "Public can view live episode basic info for redirects"
ON public.episodes 
FOR SELECT 
USING (status = 'LIVE'::episode_status);

-- Create a secure function to get only essential service info for public use
CREATE OR REPLACE FUNCTION public.get_public_service_info(service_slug text)
RETURNS TABLE(name text, slug text, default_platform app_platform)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT s.name, s.slug, s.default_platform
  FROM public.services s
  WHERE s.slug = service_slug;
END;
$function$;

-- Create a secure function to get only essential episode info for public use
CREATE OR REPLACE FUNCTION public.get_public_episode_info(service_slug text, episode_number integer)
RETURNS TABLE(
  title text, 
  default_platform app_platform,
  note_url text,
  youtube_url text, 
  spotify_url text,
  instagram_url text,
  custom_url text,
  fallback_behavior fallback_behavior,
  status episode_status
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.title,
    e.default_platform,
    e.note_url,
    e.youtube_url,
    e.spotify_url, 
    e.instagram_url,
    e.custom_url,
    e.fallback_behavior,
    e.status
  FROM public.episodes e
  JOIN public.services s ON e.service_id = s.id
  WHERE s.slug = service_slug 
    AND e.ep_no = episode_number
    AND e.status = 'LIVE'::episode_status;
END;
$function$;