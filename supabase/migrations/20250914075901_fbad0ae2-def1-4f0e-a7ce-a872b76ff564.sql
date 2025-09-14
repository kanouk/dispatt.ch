-- Create user_platforms table for custom delivery destinations
CREATE TABLE public.user_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_name TEXT NOT NULL,
  platform_slug TEXT NOT NULL,
  platform_icon TEXT,
  platform_color TEXT,
  url_template TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform_slug)
);

-- Enable RLS on user_platforms
ALTER TABLE public.user_platforms ENABLE ROW LEVEL SECURITY;

-- Create policies for user_platforms
CREATE POLICY "Users can view their own platforms" 
ON public.user_platforms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own platforms" 
ON public.user_platforms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platforms" 
ON public.user_platforms 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platforms" 
ON public.user_platforms 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_platforms_updated_at
BEFORE UPDATE ON public.user_platforms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add custom_platform_id to episodes table for linking to user platforms
ALTER TABLE public.episodes 
ADD COLUMN custom_platform_id UUID REFERENCES public.user_platforms(id);

-- Create index for better performance
CREATE INDEX idx_user_platforms_user_id ON public.user_platforms(user_id);
CREATE INDEX idx_user_platforms_slug ON public.user_platforms(user_id, platform_slug);
CREATE INDEX idx_episodes_custom_platform ON public.episodes(custom_platform_id);