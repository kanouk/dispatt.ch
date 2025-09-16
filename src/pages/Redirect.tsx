import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PlatformIcon } from '@/components/ui/platform-icon';

// Public redirect bridge: accepts dispatt.ch/{service}/ep/{epNo}/[:variant]
// and forwards to the Supabase Edge Function which performs the actual redirect
// and logs the click. We preserve query parameters. We also set noindex.

const PROJECT_ID = 'ykimfxowxsmktqzvcmom';
const FUNCTIONS_ORIGIN = `https://${PROJECT_ID}.functions.supabase.co`;

const Redirect: React.FC = () => {
  const { service, epNo, variant } = useParams();
  const location = useLocation();
  const [serviceName, setServiceName] = useState<string>('');
  const [episodeTitle, setEpisodeTitle] = useState<string>('');

  // プラットフォーム名の日本語変換
  const getPlatformName = (platform?: string) => {
    switch (platform) {
      case 'youtube': return 'YouTube';
      case 'spotify': return 'Spotify';
      case 'note': return 'Note';
      case 'apple': return 'Apple Podcasts';
      case 'google': return 'Google Podcasts';
      case 'instagram': return 'Instagram';
      case 'tiktok': return 'TikTok';
      default: return 'デフォルト';
    }
  };

  // プラットフォームのアイコン名マッピング
  const getPlatformIconName = (platform?: string) => {
    switch (platform) {
      case 'youtube': return 'SiYoutube';
      case 'spotify': return 'SiSpotify';
      case 'note': return 'FaStickyNote';
      case 'apple': return 'SiApplepodcasts';
      case 'google': return 'SiGooglepodcasts';
      case 'instagram': return 'SiInstagram';
      case 'tiktok': return 'SiTiktok';
      default: return 'FaGlobe';
    }
  };

  // プラットフォームのアイコン色マッピング
  const getPlatformIconColor = (platform?: string) => {
    switch (platform) {
      case 'youtube': return '#FF0000';
      case 'spotify': return '#1DB954';
      case 'note': return '#41C9B4';
      case 'apple': return '#A855F7';
      case 'google': return '#4285F4';
      case 'instagram': return '#E4405F';
      case 'tiktok': return '#000000';
      default: return 'hsl(var(--primary))';
    }
  };

  const platformName = getPlatformName(variant);
  const episodeNumber = epNo ? `第${epNo}話` : 'エピソード';

  useEffect(() => {
    const fetchServiceInfo = async () => {
      if (!service) return;

      try {
        // Use the secure function to get only minimal service data
        const { data: serviceData, error: serviceError } = await supabase
          .rpc('get_service_display_info', { service_slug: service });

        if (serviceError || !serviceData || serviceData.length === 0) {
          console.error('Service not found:', serviceError);
          setServiceName(service); // フォールバック
        } else {
          setServiceName(serviceData[0].name);
          
          // Get episode info if needed (this still requires authentication for user's own episodes)
          if (epNo) {
            // Only fetch episode data for authenticated users viewing their own content
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: episodeData } = await supabase
                .from('episodes')
                .select('title')
                .eq('ep_no', parseInt(epNo))
                .single();
                
              if (episodeData?.title) {
                setEpisodeTitle(episodeData.title);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching service info:', error);
        setServiceName(service || 'サービス');
      }
    };

    fetchServiceInfo();
  }, [service, epNo]);

  useEffect(() => {
    if (!service || !epNo) return;

    const path = variant
      ? `/${service}/ep/${epNo}/${variant}`
      : `/${service}/ep/${epNo}`;

    const url = new URL(`${FUNCTIONS_ORIGIN}/redirect${path}`);

    // Preserve all query params
    const current = new URLSearchParams(location.search);
    current.forEach((v, k) => {
      if (!url.searchParams.has(k)) url.searchParams.set(k, v);
    });

    // 短い遅延後にリダイレクト（情報を表示するため）
    const timer = setTimeout(() => {
      window.location.replace(url.toString());
    }, 3000);

    return () => clearTimeout(timer);
  }, [service, epNo, variant, location.search]);

  return (
    <main role="main" className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center p-6">
      {/* SEO and metadata */}
      <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      <meta name="robots" content="noindex" />
      <meta name="description" content="エピソードへのリダイレクトを処理中です" />
      <title>リダイレクト中 | dispatt.ch</title>

      <section className="bg-card rounded-3xl shadow-xl border p-12 max-w-lg w-full text-center animate-fade-in">
        {/* Rocket loading indicator */}
        <div className="mb-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-center">
            <span 
              className="text-4xl" 
              style={{ 
                animation: 'shake 0.15s ease-in-out infinite',
                transformOrigin: 'center'
              }}
            >
              🚀
            </span>
          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(-1px, -1px) rotate(-1deg); }
            50% { transform: translate(1px, -1px) rotate(1deg); }
            75% { transform: translate(-1px, 1px) rotate(-1deg); }
          }
        `}</style>

        {/* Content with staggered animations */}
        <div className="space-y-6">
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              移動中
            </h1>
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full"></div>
          </div>
          
          <div className="animate-fade-in space-y-3" style={{ animationDelay: '0.6s' }}>
            <p className="text-xl font-semibold text-foreground">
              {serviceName || 'サービス'}
            </p>
            <p className="text-muted-foreground">
              {episodeTitle ? (
                <>
                  {episodeNumber}: {episodeTitle}
                  <br />
                  <span className="inline-flex items-center gap-2 mt-2">
                    <PlatformIcon iconName={getPlatformIconName(variant)} size={20} color={getPlatformIconColor(variant)} />
                    <span className="text-primary font-medium">{platformName}へ移動中</span>
                  </span>
                </>
              ) : (
                <>
                  <span>{episodeNumber}</span>
                  <br />
                  <span className="inline-flex items-center gap-2 mt-2">
                    <PlatformIcon iconName={getPlatformIconName(variant)} size={20} color={getPlatformIconColor(variant)} />
                    <span className="text-primary font-medium">{platformName}へ移動中</span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Redirect;
