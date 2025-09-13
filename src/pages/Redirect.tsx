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
    <main role="main" className="min-h-screen flex items-center justify-center p-6">
      <section className="text-center max-w-md">
        <h1 className="text-xl font-semibold tracking-tight">転送中…</h1>
        <p className="mt-2 text-sm opacity-80">少々お待ちください</p>
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta name="robots" content="noindex" />
        <meta name="description" content="エピソードへのリダイレクトを処理中です" />
        <title>リダイレクト中 | dispatt.ch</title>
      </section>
    </main>
  );
};

export default Redirect;
