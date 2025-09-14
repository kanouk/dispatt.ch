import { AdminLayout } from "@/components/layout/AdminLayout";
import { useServices } from "@/hooks/useServices";
import { useEpisodes } from "@/hooks/useEpisodes";
import { useAnalyticsSummary } from "@/hooks/useAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Users, ExternalLink, Calendar, Settings, Play, TrendingUp } from "lucide-react";

const Admin = () => {
  const { data: services } = useServices();
  const { data: episodes } = useEpisodes();
  const { data: analytics } = useAnalyticsSummary({ 
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    excludeBots: true 
  });

  // Get upcoming episodes (status DRAFT)
  const upcomingEpisodes = episodes?.filter(ep => ep.status === 'DRAFT').slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-muted-foreground">
          短縮URL管理システムの概要とKPI
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              直近7日の総クリック
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalClicks || 0}</div>
            <p className="text-xs text-muted-foreground">
              過去7日間の合計
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              推定ユニークユーザー
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.uniqueClicks || 0}</div>
            <p className="text-xs text-muted-foreground">
              過去7日間の推定値
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              登録サービス
            </CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              設定済みサービス数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              総エピソード
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{episodes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              全エピソード数
            </p>
          </CardContent>
        </Card>
      </div>

    </AdminLayout>
  );
};

export default Admin;