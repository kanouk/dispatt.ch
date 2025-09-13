import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'ダッシュボード', icon: '🏠' },
    { path: '/admin/services', label: 'サービス設定', icon: '⚙️' },
    { path: '/admin/episodes', label: 'エピソード管理', icon: '📺' },
    { path: '/admin/analytics', label: '分析', icon: '📊' },
    { path: '/health', label: 'ヘルスチェック', icon: '⚡' },
  ];

  return (
    <div className="drawer-side">
      <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
      <aside className="w-64 min-h-full bg-base-200">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">メニュー</h2>
          <ul className="menu">
            {menuItems.map((item) => (
              <li key={item.path}>
                <a
                  className={`${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="text-lg mr-2">{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};