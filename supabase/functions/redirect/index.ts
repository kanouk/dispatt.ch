import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple bot detection
const isBot = (userAgent: string): boolean => {
  const botPatterns = /bot|crawl|spider|scrape|curl|wget|http|python|java|go\/|ruby|php|perl|node/i;
  return botPatterns.test(userAgent);
}

// Extract domain from URL
const extractDomain = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// Hash IP with salt for privacy
const hashIP = async (ip: string): Promise<string> => {
  const salt = Deno.env.get('IP_HASH_SALT');
  if (!salt) {
    console.error('IP_HASH_SALT environment variable not set');
    throw new Error('Server configuration error');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get client IP from headers
const getClientIP = (headers: Headers): string => {
  return headers.get('x-forwarded-for')?.split(',')[0].trim() || 
         headers.get('x-real-ip') || 
         'unknown';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const rawPathname = url.pathname;
    // Normalize to allow calling as /redirect/{service}/ep/{...}
    const pathname = rawPathname.replace(/^\/redirect(\/|$)/, '/');
    const searchParams = url.searchParams;
    
    console.log('Redirect request:', { rawPathname, pathname, search: url.search });

    // Parse URL patterns: 
    // /{service}/ep/{epNo|alias}(/{variant})?
    // /{service}/a/{alias}(/{variant})?
    const episodeRegex = /^\/([^\/]+)\/ep\/([^\/]+)(?:\/([^\/]+))?$/;
    const serviceAliasRegex = /^\/([^\/]+)\/a\/([^\/]+)(?:\/([^\/]+))?$/;
    
    const episodeMatch = pathname.match(episodeRegex);
    const serviceAliasMatch = pathname.match(serviceAliasRegex);
    
    if (!episodeMatch && !serviceAliasMatch) {
      console.log('Invalid path format:', pathname);
      return new Response('Not Found', { 
        status: 404, 
        headers: { ...corsHeaders, 'X-Robots-Tag': 'noindex' }
      });
    }

    let serviceSlug: string;
    let epNoOrAlias: string;
    let variant: string | undefined;
    let isServiceAlias = false;

    if (serviceAliasMatch) {
      [, serviceSlug, epNoOrAlias, variant] = serviceAliasMatch;
      isServiceAlias = true;
    } else {
      [, serviceSlug, epNoOrAlias, variant] = episodeMatch!;
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find service by slug
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('slug', serviceSlug)
      .single();

    if (serviceError || !service) {
      console.log('Service not found:', serviceSlug, serviceError);
      return new Response('Not Found', { 
        status: 404, 
        headers: { ...corsHeaders, 'X-Robots-Tag': 'noindex' }
      });
    }

    if (isServiceAlias) {
      // Handle service alias: /{service}/a/{alias}(/{variant})?
      const { data: serviceAlias, error: aliasError } = await supabase
        .from('service_aliases')
        .select('*')
        .eq('service_id', service.id)
        .eq('alias', epNoOrAlias)
        .eq('is_enabled', true)
        .single();

      if (aliasError || !serviceAlias) {
        console.log('Service alias not found:', epNoOrAlias, aliasError);
        return new Response('Not Found', { 
          status: 404, 
          headers: { ...corsHeaders, 'X-Robots-Tag': 'noindex' }
        });
      }

      // Service alias found, redirect to the specified URL
      redirectUrl = serviceAlias.redirect_url;
      actualVariant = variant || 'service_alias';
      
      // Log the click (best effort)
      try {
        const userAgent = req.headers.get('user-agent') || '';
        const referrer = req.headers.get('referer') || req.headers.get('referrer') || '';
        const clientIP = getClientIP(req.headers);
        const ipHash = await hashIP(clientIP);
        
        const clickData = {
          service_id: service.id,
          episode_id: null,
          ep_no: null,
          variant: actualVariant,
          referrer: referrer || null,
          referer_domain: referrer ? extractDomain(referrer) : null,
          utm_source: searchParams.get('utm_source') || null,
          utm_medium: searchParams.get('utm_medium') || null,
          utm_campaign: searchParams.get('utm_campaign') || null,
          user_agent: userAgent,
          is_bot: isBot(userAgent),
          ip_hash: ipHash,
          host: req.headers.get('host') || null,
          path: pathname,
        };

        await supabase.from('clicks').insert(clickData);
        console.log('Service alias click logged successfully');
      } catch (error) {
        console.error('Failed to log service alias click:', error);
      }

      // Merge query parameters
      const targetUrl = new URL(redirectUrl);
      for (const [key, value] of searchParams.entries()) {
        if (!targetUrl.searchParams.has(key)) {
          targetUrl.searchParams.set(key, value);
        }
      }

      console.log('Redirecting to service alias:', targetUrl.toString());

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': targetUrl.toString(),
          'X-Robots-Tag': 'noindex'
        }
      });
    }

    // Handle episode: /{service}/ep/{epNo|alias}(/{variant})?
    let episode: any = null;
    let epNo: number | null = null;
    
    // Check if epNoOrAlias is a number (episode number) or string (alias)
    const parsedEpNo = parseInt(epNoOrAlias);
    if (!isNaN(parsedEpNo) && parsedEpNo > 0 && parsedEpNo.toString() === epNoOrAlias) {
      // It's a valid episode number
      epNo = parsedEpNo;
      const { data: episodeData, error: episodeError } = await supabase
        .from('episodes')
        .select('*')
        .eq('service_id', service.id)
        .eq('ep_no', epNo)
        .single();
      
      if (!episodeError && episodeData) {
        episode = episodeData;
      }
    } else {
      // It's an alias
      const { data: episodeData, error: episodeError } = await supabase
        .from('episodes')
        .select('*')
        .eq('service_id', service.id)
        .eq('alias', epNoOrAlias)
        .single();
      
      if (!episodeError && episodeData) {
        episode = episodeData;
        epNo = episodeData.ep_no;
      }
    }

    let redirectUrl: string | null = null;
    let actualVariant = variant || 'default';

    if (episode) {
      // Episode exists, determine redirect URL
      if (variant) {
        // Specific variant requested
        switch (variant.toLowerCase()) {
          case 'note':
            redirectUrl = episode.note_url || service.note_home_url;
            break;
          case 'yt':
          case 'youtube':
            redirectUrl = episode.youtube_url || service.youtube_channel_url;
            actualVariant = 'yt';
            break;
          case 'spotify':
            redirectUrl = episode.spotify_url || service.spotify_show_url;
            break;
          case 'instagram':
            redirectUrl = episode.instagram_url || service.instagram_profile_url;
            break;
          default:
            console.log('Invalid variant:', variant);
            return new Response('Not Found', { 
              status: 404, 
              headers: { ...corsHeaders, 'X-Robots-Tag': 'noindex' }
            });
        }
      } else {
        // Default platform
        switch (episode.default_platform) {
          case 'NOTE':
            redirectUrl = episode.note_url || service.note_home_url;
            break;
          case 'YOUTUBE':
            redirectUrl = episode.youtube_url || service.youtube_channel_url;
            break;
          case 'SPOTIFY':
            redirectUrl = episode.spotify_url || service.spotify_show_url;
            break;
          case 'INSTAGRAM':
            redirectUrl = episode.instagram_url || service.instagram_profile_url;
            break;
          case 'CUSTOM':
            redirectUrl = episode.custom_url;
            break;
        }
      }

      // If still no URL, check fallback behavior
      if (!redirectUrl) {
        if (episode.fallback_behavior === 'COMING_SOON') {
          return new Response(`
            <!DOCTYPE html>
            <html lang="ja">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="robots" content="noindex">
              <title>公開準備中 - dispatt.ch</title>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh; 
                  margin: 0; 
                  background: white;
                  color: #333;
                }
                .container { text-align: center; padding: 2rem; }
                h1 { font-size: 2rem; margin-bottom: 1rem; }
                p { font-size: 1.1rem; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>公開準備中です</h1>
                <p>このコンテンツはまもなく公開予定です</p>
              </div>
            </body>
            </html>
          `, {
            status: 200,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'text/html; charset=utf-8',
              'X-Robots-Tag': 'noindex' 
            }
          });
        }
        // FALLBACK_TO_CHANNEL - will be handled below
      }
    } else {
      // Episode doesn't exist (neither by number nor alias), use service fallback
      if (variant) {
        switch (variant.toLowerCase()) {
          case 'note':
            redirectUrl = service.note_home_url;
            break;
          case 'yt':
          case 'youtube':
            redirectUrl = service.youtube_channel_url;
            actualVariant = 'yt';
            break;
          case 'spotify':
            redirectUrl = service.spotify_show_url;
            break;
          case 'instagram':
            redirectUrl = service.instagram_profile_url;
            break;
          default:
            return new Response('Not Found', { 
              status: 404, 
              headers: { ...corsHeaders, 'X-Robots-Tag': 'noindex' }
            });
        }
      } else {
        // Use service default platform
        switch (service.default_platform) {
          case 'NOTE':
            redirectUrl = service.note_home_url;
            break;
          case 'YOUTUBE':
            redirectUrl = service.youtube_channel_url;
            break;
          case 'SPOTIFY':
            redirectUrl = service.spotify_show_url;
            break;
          case 'INSTAGRAM':
            redirectUrl = service.instagram_profile_url;
            break;
        }
      }
    }

    if (!redirectUrl) {
      console.log('No redirect URL found');
      return new Response('Not Found', { 
        status: 404, 
        headers: { ...corsHeaders, 'X-Robots-Tag': 'noindex' }
      });
    }

    // Merge query parameters
    const targetUrl = new URL(redirectUrl);
    for (const [key, value] of searchParams.entries()) {
      if (!targetUrl.searchParams.has(key)) {
        targetUrl.searchParams.set(key, value);
      }
    }

    // Log the click (best effort, don't fail redirect if this fails)
    try {
      const userAgent = req.headers.get('user-agent') || '';
      const referrer = req.headers.get('referer') || req.headers.get('referrer') || '';
      const clientIP = getClientIP(req.headers);
      const ipHash = await hashIP(clientIP);
      
      const clickData = {
        service_id: service.id,
        episode_id: episode?.id || null,
        ep_no: epNo || episode?.ep_no || null,
        variant: actualVariant,
        referrer: referrer || null,
        referer_domain: referrer ? extractDomain(referrer) : null,
        utm_source: searchParams.get('utm_source') || null,
        utm_medium: searchParams.get('utm_medium') || null,
        utm_campaign: searchParams.get('utm_campaign') || null,
        user_agent: userAgent,
        is_bot: isBot(userAgent),
        ip_hash: ipHash,
        host: req.headers.get('host') || null,
        path: pathname,
      };

      await supabase.from('clicks').insert(clickData);
      console.log('Click logged successfully');
    } catch (error) {
      console.error('Failed to log click:', error);
      // Continue with redirect even if logging fails
    }

    // Determine redirect status code
    const isPermanent = Deno.env.get('FORCE_PERMANENT_REDIRECT') === 'true';
    const redirectStatus = isPermanent ? 308 : 302;

    console.log('Redirecting to:', targetUrl.toString());

    return new Response(null, {
      status: redirectStatus,
      headers: {
        ...corsHeaders,
        'Location': targetUrl.toString(),
        'X-Robots-Tag': 'noindex'
      }
    });

  } catch (error) {
    console.error('Redirect function error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: { ...corsHeaders, 'X-Robots-Tag': 'noindex' }
    });
  }
});