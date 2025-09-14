import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// Public redirect bridge: accepts dispatt.ch/{service}/ep/{epNo}/[:variant]
// and forwards to the Supabase Edge Function which performs the actual redirect
// and logs the click. We preserve query parameters. We also set noindex.

const PROJECT_ID = 'ykimfxowxsmktqzvcmom';
const FUNCTIONS_ORIGIN = `https://${PROJECT_ID}.functions.supabase.co`;

const Redirect: React.FC = () => {
  const { service, epNo, variant } = useParams();
  const location = useLocation();

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

    // Send the browser to the Edge Function which will 302/308 to the target
    window.location.replace(url.toString());
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
            接続中...
          </h1>
          
          <p className="text-lg text-gray-700 mb-4 font-medium">
            お気に入りのプラットフォームへ
          </p>

          {/* Loading dots */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
            
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-gray-800">ジャンプ中</span> 🌟
            </p>
          </div>

          {/* Fun message */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-blue-600">dispatt.ch</span> で<br />
              もっと楽しいコンテンツ体験を！
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">まもなく完了します...</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Redirect;
