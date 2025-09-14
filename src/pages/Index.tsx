// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-blue-50 rounded-2xl p-8 md:p-12 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
          Dispatt Admin
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          短縮URLサービスの管理画面へようこそ！<br />
          あなたの配信をもっと身近に 📡✨
        </p>
        <div className="flex justify-center gap-2">
          <span className="animate-bounce text-2xl" style={{ animationDelay: '0ms' }}>📊</span>
          <span className="animate-bounce text-2xl" style={{ animationDelay: '150ms' }}>🎬</span>
          <span className="animate-bounce text-2xl" style={{ animationDelay: '300ms' }}>⚡</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 border card-hover text-center">
          <div className="text-3xl mb-2">📈</div>
          <h3 className="font-semibold text-lg mb-1">アクセス解析</h3>
          <p className="text-muted-foreground text-sm">リアルタイムでデータを確認</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 border card-hover text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-semibold text-lg mb-1">簡単管理</h3>
          <p className="text-muted-foreground text-sm">直感的な操作でURL管理</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 border card-hover text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="font-semibold text-lg mb-1">高速配信</h3>
          <p className="text-muted-foreground text-sm">瞬時にリダイレクト</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl p-6 border">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span>🎮</span>
          クイックアクション
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/services" className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div>
                <div className="font-medium">サービス管理</div>
                <div className="text-sm text-muted-foreground">エピソードとURLを管理</div>
              </div>
            </div>
          </a>
          
          <a href="/analytics" className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-medium">分析データ</div>
                <div className="text-sm text-muted-foreground">アクセス統計を確認</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
