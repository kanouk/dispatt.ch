-- Remove the overly permissive policy that exposes all service data
DROP POLICY "Public can view service names for redirects" ON public.services;

-- Create a security definer function that only returns minimal data needed for redirects
CREATE OR REPLACE FUNCTION public.get_service_display_info(service_slug text)
RETURNS TABLE(name text, slug text) AS $$
BEGIN
  RETURN QUERY
  SELECT s.name, s.slug
  FROM public.services s
  WHERE s.slug = service_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_service_display_info(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_service_display_info(text) TO authenticated;