import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// Public redirect bridge: accepts dispatt.ch/{service}/ep/{epNo}/[:variant]
// and forwards to the Supabase Edge Function which performs the actual redirect
// and logs the click. We preserve query parameters. We also set noindex.

const PROJECT_ID = 'ykimfxowxsmktqzvcmom';
const FUNCTIONS_ORIGIN = `https://${PROJECT_ID}.functions.supabase.co`;

const Redirect: React.FC = () => {
  const { service, epNo, variant } = useParams();
  const location = useLocation();
  const [countdown, setCountdown] = useState(3);

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

  // サービス名を日本語に変換（必要に応じてカスタマイズ）
  const getServiceDisplayName = (serviceSlug?: string) => {
    if (!serviceSlug) return 'サービス';
    
    // スラッグを日本語表示用に変換
    switch (serviceSlug) {
      case 'kosui-radio': return '香水ラジオ';
      case 'tech-talk': return 'テックトーク';  
      // 他のサービスも必要に応じて追加
      default: 
        // スラッグをそのまま表示（ハイフンをスペースに変換）
        return serviceSlug.replace(/-/g, ' ');
    }
  };

  const serviceName = getServiceDisplayName(service);
  const platformName = getPlatformName(variant);
  const episodeNumber = epNo ? `第${epNo}話` : 'エピソード';

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

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Send the browser to the Edge Function which will 302/308 to the target
          window.location.replace(url.toString());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
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
            {countdown > 0 ? `${countdown}秒後に移動` : '移動中...'}
          </h1>
          
          <div className="mb-4 space-y-1">
            <p className="text-lg font-semibold text-gray-800">
              {serviceName}
            </p>
            <p className="text-base text-gray-600">
              {episodeNumber} → <span className="text-blue-600 font-medium">{platformName}</span>
            </p>
          </div>

          {/* Countdown circle */}
          <div className="space-y-4 mb-6">
            <div className="relative w-16 h-16 mx-auto">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(3 - countdown) * (175.9 / 3)} 175.9`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{countdown}</span>
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
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000" 
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {countdown > 0 ? 'コンテンツを準備中...' : 'まもなく完了！'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Redirect;
