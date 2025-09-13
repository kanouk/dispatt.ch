// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dispatt Admin
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          🎯 短縮URLサービスの管理画面へようこそ！
        </p>
        <div className="flex justify-center gap-4 text-4xl">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>✨</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>🎨</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>⚡</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
