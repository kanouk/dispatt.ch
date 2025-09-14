import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <label htmlFor="drawer-toggle" className="lg:hidden mr-3 p-2 rounded-lg hover:bg-muted transition-colors">
              <Menu className="w-5 h-5" />
            </label>
            <button 
              className="flex items-center gap-2 text-xl font-bold hover:text-primary transition-colors" 
              onClick={() => navigate('/')}
            >
              <span className="text-2xl">🚀</span>
              Dispatt
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                <img 
                  src={user?.user_metadata?.avatar_url || '/placeholder.svg'} 
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-border"
                />
                <span className="hidden sm:block text-sm font-medium max-w-32 truncate">{user?.email}</span>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">管理者</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 mt-1"
                >
                  <span>👋</span>
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};