import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';

const Admin = () => {
  const { user } = useAuth();

  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-6 bg-base-100">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">ダッシュボード</h1>
              <p className="text-base-content/70 mt-2">
                ようこそ、{user?.email}さん
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-figure text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <div className="stat-title">総ユーザー数</div>
                <div className="stat-value text-primary">1</div>
                <div className="stat-desc">管理者のみ</div>
              </div>
              
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-figure text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div className="stat-title">システム状態</div>
                <div className="stat-value text-secondary">正常</div>
                <div className="stat-desc">全システム稼働中</div>
              </div>
              
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-figure text-accent">
                  <div className="avatar online">
                    <div className="w-16 rounded-full">
                      <img src={user?.user_metadata?.avatar_url || '/placeholder.svg'} alt="Avatar" />
                    </div>
                  </div>
                </div>
                <div className="stat-value">オンライン</div>
                <div className="stat-title">管理者状態</div>
                <div className="stat-desc text-accent">アクティブ</div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>これは管理者向けダッシュボードの骨格です。必要な機能を追加してください。</span>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Sidebar />
    </div>
  );
};

export default Admin;