import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'ダッシュボード', icon: '🏠' },
    { path: '/services', label: 'サービス・エピソード', icon: '🎬' },
    { path: '/platforms', label: 'プラットフォーム管理', icon: '⚙️' },
    { path: '/analytics', label: '分析', icon: '📊' },
  ];

  return (
    <div className="drawer-side">
      <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
      <aside className="w-64 min-h-full bg-card border-r border-border">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-muted-foreground mb-1">
              ナビゲーション
            </h2>
            <div className="w-8 h-0.5 bg-primary rounded-full"></div>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  location.pathname === item.path 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => navigate(item.path)}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
};