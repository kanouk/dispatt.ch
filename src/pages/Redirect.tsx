import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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

  const platformName = getPlatformName(variant);
  const episodeNumber = epNo ? `第${epNo}話` : 'エピソード';

  useEffect(() => {
    const fetchServiceInfo = async () => {
      if (!service) return;

      try {
        // サービス情報を取得
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('name, id')
          .eq('slug', service)
          .single();

        if (serviceError || !serviceData) {
          console.error('Service not found:', serviceError);
          setServiceName(service); // フォールバック
        } else {
          setServiceName(serviceData.name);
          
          // エピソード情報も取得
          if (epNo) {
            const { data: episodeData } = await supabase
              .from('episodes')
              .select('title')
              .eq('service_id', serviceData.id)
              .eq('ep_no', parseInt(epNo))
              .single();
              
            if (episodeData?.title) {
              setEpisodeTitle(episodeData.title);
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
    }, 1500);

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
        {/* Elegant loading indicator */}
        <div className="mb-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

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
                  <span className="inline-flex items-center gap-1 mt-1">
                    <span>→</span>
                    <span className="text-primary font-medium">{platformName}</span>
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span>{episodeNumber}</span>
                  <span>→</span>
                  <span className="text-primary font-medium">{platformName}</span>
                </span>
              )}
            </p>
          </div>

          {/* Walking cat animation */}
          <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="bg-muted rounded-2xl p-6 border">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-primary">✨</span>
                <span className="text-sm font-medium text-muted-foreground">少しお待ちください</span>
              </div>
              <div className="relative w-full h-8 bg-muted-foreground/10 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 flex items-center">
                  <div className="animate-walk text-xl">
                    🐱
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Redirect;
