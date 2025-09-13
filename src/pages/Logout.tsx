import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Logout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "ログアウトエラー",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "ログアウト完了",
          description: "正常にログアウトしました",
        });
      }
      navigate('/login');
    };

    handleLogout();
  }, [signOut, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col items-center space-y-4">
            <span className="loading loading-spinner loading-lg"></span>
            <p>ログアウト中...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;