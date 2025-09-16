-- Phase 1: Database expansion for alias functionality

-- Create service_aliases table for service-level aliases (/service/a/alias/platform)
CREATE TABLE public.service_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  redirect_url TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT service_aliases_service_alias_unique UNIQUE(service_id, alias)
);

-- Enable RLS for service_aliases
ALTER TABLE public.service_aliases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_aliases
CREATE POLICY "Users can view their own service aliases" 
ON public.service_aliases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service aliases" 
ON public.service_aliases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service aliases" 
ON public.service_aliases 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service aliases" 
ON public.service_aliases 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add alias column to episodes table for episode-level aliases (/service/ep/alias/platform)
ALTER TABLE public.episodes ADD COLUMN alias TEXT;

-- Create unique constraint for episodes service_id + alias (excluding NULLs for backward compatibility)
CREATE UNIQUE INDEX episodes_service_alias_unique 
ON public.episodes(service_id, alias) 
WHERE alias IS NOT NULL;

-- Add trigger for service_aliases updated_at
CREATE TRIGGER update_service_aliases_updated_at
BEFORE UPDATE ON public.service_aliases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();