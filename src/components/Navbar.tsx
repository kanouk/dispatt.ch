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
    <div className="navbar bg-base-200 shadow-lg">
      <div className="flex-1">
        <label htmlFor="drawer-toggle" className="btn btn-ghost lg:hidden mr-2">
          <Menu className="w-5 h-5" />
        </label>
        <a className="btn btn-ghost normal-case text-xl" onClick={() => navigate('/admin')}>
          Dispatt Admin
        </a>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img src={user?.user_metadata?.avatar_url || '/placeholder.svg'} alt="Avatar" />
            </div>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <div className="justify-between">
                <span>{user?.email}</span>
              </div>
            </li>
            <li><a onClick={handleLogout}>ログアウト</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};