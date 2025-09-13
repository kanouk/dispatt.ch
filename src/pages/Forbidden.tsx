import { useNavigate } from 'react-router-dom';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="card-title justify-center text-2xl mb-4">アクセス拒否</h2>
            <p className="text-base-content/70 mb-6">
              このページにアクセスする権限がありません。<br/>
              管理者権限が必要です。
            </p>
            <div className="card-actions justify-center space-x-2">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                ログイン画面へ
              </button>
              <button 
                className="btn btn-ghost"
                onClick={() => navigate('/')}
              >
                ホームへ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;