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
    <main role="main" className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6 overflow-hidden relative">
      {/* SEO and metadata */}
      <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      <meta name="robots" content="noindex" />
      <meta name="description" content="エピソードへのリダイレクトを処理中です" />
      <title>リダイレクト中 | dispatt.ch</title>

      {/* Floating animated elements */}
      <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🚀</div>
      <div className="absolute top-32 right-16 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
      <div className="absolute bottom-20 left-20 text-3xl animate-bounce" style={{ animationDelay: '1s' }}>🎬</div>
      <div className="absolute bottom-32 right-12 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>🎵</div>
      <div className="absolute top-1/2 left-8 text-2xl animate-bounce" style={{ animationDelay: '2s' }}>📱</div>
      <div className="absolute top-1/3 right-8 text-2xl animate-bounce" style={{ animationDelay: '2.5s' }}>💫</div>

      <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 bg-purple-500 rounded-full"></div>
          <div className="absolute top-1/2 left-2 w-4 h-4 bg-pink-500 rounded-full"></div>
        </div>

        <div className="relative z-10">
          {/* Loading spinner */}
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin mx-auto mb-4 flex items-center justify-center" style={{ animationDuration: '2s' }}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            移動中...
          </h1>
          
          <div className="mb-4 space-y-1">
            <p className="text-lg font-semibold text-gray-800">
              {serviceName || 'サービス'}
            </p>
            <p className="text-base text-gray-600">
              {episodeTitle ? (
                <>
                  {episodeNumber}: {episodeTitle} → <span className="text-blue-600 font-medium">{platformName}</span>
                </>
              ) : (
                <>
                  {episodeNumber} → <span className="text-blue-600 font-medium">{platformName}</span>
                </>
              )}
            </p>
          </div>

          {/* Loading animation */}
          <div className="space-y-4 mb-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin mx-auto flex items-center justify-center" style={{ animationDuration: '1s' }}>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm">
              少しお待ちください 🚀
            </p>
          </div>

          {/* Fun message */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-blue-600">dispatt.ch</span> で<br />
              コンテンツを簡単にお届け！
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              まもなく完了！
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Redirect;
