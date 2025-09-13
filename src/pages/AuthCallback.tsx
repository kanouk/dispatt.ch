import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "認証エラー",
            description: "ログイン処理中にエラーが発生しました",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        if (data.session) {
          toast({
            title: "ログイン成功",
            description: "ダッシュボードへリダイレクトします",
          });
          navigate('/');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col items-center space-y-4">
            <span className="loading loading-spinner loading-lg"></span>
            <p>認証処理中...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;