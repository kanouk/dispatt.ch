import { useState, useMemo } from 'react';
import { CalendarDays, Download, TrendingUp, Users, MousePointer, Bot } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useServices } from '@/hooks/useServices';
import { useAnalytics, useAnalyticsSummary } from '@/hooks/useAnalytics';
import { useEpisodes } from '@/hooks/useEpisodes';
import type { DateRange } from 'react-day-picker';

const Analytics = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedEpisode, setSelectedEpisode] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [excludeBots, setExcludeBots] = useState(true);

  const { data: services = [] } = useServices();
  const { data: episodes = [] } = useEpisodes(selectedServiceId);
  
  const analyticsFilters = useMemo(() => ({
    serviceId: selectedServiceId || undefined,
    epNo: selectedEpisode ? parseInt(selectedEpisode) : undefined,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    excludeBots,
  }), [selectedServiceId, selectedEpisode, dateRange, excludeBots]);

  const { data: analyticsData = [] } = useAnalytics(analyticsFilters);
  const { data: summaryData } = useAnalyticsSummary(analyticsFilters);

  // Process data for charts
  const dailyClicks = useMemo(() => {
    const dailyData = analyticsData.reduce((acc, click) => {
      const date = new Date(click.created_at).toLocaleDateString('ja-JP');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyData)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [analyticsData]);

  const platformData = useMemo(() => {
    const platforms = analyticsData.reduce((acc, click) => {
      const platform = click.variant || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(platforms).map(([name, value]) => ({ name, value }));
  }, [analyticsData]);

  const referrerData = useMemo(() => {
    const referrers = analyticsData.reduce((acc, click) => {
      const referrer = click.referer_domain || 'direct';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(referrers)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [analyticsData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const exportCSV = () => {
    const headers = [
      'Date',
      'Service',
      'Episode',
      'Platform',
      'Referrer',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'User Agent',
      'Is Bot'
    ];

    const csvData = analyticsData.map(click => [
      new Date(click.created_at).toLocaleDateString('ja-JP'),
      services.find(s => s.id === click.service_id)?.name || '',
      click.ep_no || '',
      click.variant || '',
      click.referer_domain || '',
      click.utm_source || '',
      click.utm_medium || '',
      click.utm_campaign || '',
      click.user_agent || '',
      click.is_bot ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">分析</h1>
          <p className="text-muted-foreground">クリック数や参照元などの分析データを確認できます</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>フィルター</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="service-select">サービス</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger id="service-select">
                    <SelectValue placeholder="すべてのサービス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">すべてのサービス</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="episode-select">エピソード</Label>
                <Select value={selectedEpisode} onValueChange={setSelectedEpisode}>
                  <SelectTrigger id="episode-select">
                    <SelectValue placeholder="すべてのエピソード" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">すべてのエピソード</SelectItem>
                    {episodes.map((episode) => (
                      <SelectItem key={episode.id} value={episode.ep_no.toString()}>
                        #{episode.ep_no} {episode.title && `- ${episode.title}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>期間</Label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="exclude-bots"
                  checked={excludeBots}
                  onCheckedChange={setExcludeBots}
                />
                <Label htmlFor="exclude-bots">ボットを除外</Label>
              </div>
            </div>
            
            <Button onClick={exportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              CSVエクスポート
            </Button>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総クリック数</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData?.totalClicks || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ユニーククリック</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData?.uniqueClicks || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ボットクリック</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.filter(click => click.is_bot).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CTR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData?.totalClicks && summaryData?.uniqueClicks 
                  ? `${((summaryData.uniqueClicks / summaryData.totalClicks) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>日別クリック数</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyClicks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>プラットフォーム別</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Referrer Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>参照元トップ10</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>参照元</TableHead>
                  <TableHead>クリック数</TableHead>
                  <TableHead>割合</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrerData.map((referrer, index) => (
                  <TableRow key={referrer.name}>
                    <TableCell className="font-medium">
                      {referrer.name === 'direct' ? (
                        <Badge variant="secondary">直接アクセス</Badge>
                      ) : (
                        referrer.name
                      )}
                    </TableCell>
                    <TableCell>{referrer.value}</TableCell>
                    <TableCell>
                      {summaryData?.totalClicks 
                        ? `${((referrer.value / summaryData.totalClicks) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Clicks Table */}
        <Card>
          <CardHeader>
            <CardTitle>最近のクリック</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>サービス</TableHead>
                  <TableHead>エピソード</TableHead>
                  <TableHead>プラットフォーム</TableHead>
                  <TableHead>参照元</TableHead>
                  <TableHead>ボット</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.slice(0, 20).map((click) => (
                  <TableRow key={click.id}>
                    <TableCell>
                      {new Date(click.created_at).toLocaleString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      {services.find(s => s.id === click.service_id)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {click.ep_no ? `#${click.ep_no}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{click.variant || 'unknown'}</Badge>
                    </TableCell>
                    <TableCell>
                      {click.referer_domain || 'direct'}
                    </TableCell>
                    <TableCell>
                      {click.is_bot ? (
                        <Badge variant="destructive">ボット</Badge>
                      ) : (
                        <Badge variant="secondary">人間</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;