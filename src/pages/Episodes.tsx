import { AdminLayout } from '@/components/layout/AdminLayout';
import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useServices } from '@/hooks/useServices';
import { useEpisodes, useCreateEpisode, useUpdateEpisode, useDeleteEpisode } from '@/hooks/useEpisodes';
import { getPublicUrl } from '@/utils/url';
import type { Episode, AppPlatform, EpisodeStatus, FallbackBehavior } from '@/types/database';

const Episodes = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const { toast } = useToast();

  const { data: services = [] } = useServices();
  const { data: episodes = [] } = useEpisodes(selectedServiceId, searchQuery);
  const createEpisodeMutation = useCreateEpisode();
  const updateEpisodeMutation = useUpdateEpisode();
  const deleteEpisodeMutation = useDeleteEpisode();

  const selectedService = services.find(s => s.id === selectedServiceId);

  const filteredEpisodes = useMemo(() => {
    return episodes.filter(episode => 
      !selectedServiceId || episode.service_id === selectedServiceId
    );
  }, [episodes, selectedServiceId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "コピーしました",
        description: "URLがクリップボードにコピーされました。",
      });
    } catch (err) {
      toast({
        title: "エラー",
        description: "URLのコピーに失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleCreateEpisode = async (episodeData: Omit<Episode, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createEpisodeMutation.mutateAsync(episodeData);
      setIsCreateDialogOpen(false);
      toast({
        title: "エピソード作成完了",
        description: "エピソードが正常に作成されました。",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "エピソードの作成に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEpisode = async (episodeData: Partial<Episode> & { id: string }) => {
    try {
      await updateEpisodeMutation.mutateAsync(episodeData);
      setEditingEpisode(null);
      toast({
        title: "エピソード更新完了",
        description: "エピソードが正常に更新されました。",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "エピソードの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    try {
      await deleteEpisodeMutation.mutateAsync(id);
      toast({
        title: "エピソード削除完了",
        description: "エピソードが正常に削除されました。",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "エピソードの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: EpisodeStatus) => {
    const variants = {
      DRAFT: { variant: 'secondary' as const, label: '下書き' },
      LIVE: { variant: 'default' as const, label: '公開中' },
      ARCHIVED: { variant: 'outline' as const, label: 'アーカイブ' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">エピソード管理</h1>
        <p className="text-muted-foreground">サービスのエピソードを管理します</p>
      </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="サービスを選択" />
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

          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="エピソード番号またはタイトルで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedServiceId}>
                <Plus className="h-4 w-4 mr-2" />
                エピソード作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新規エピソード作成</DialogTitle>
              </DialogHeader>
              <EpisodeForm
                service={selectedService}
                onSubmit={(data) => handleCreateEpisode({ ...data, service_id: selectedServiceId })}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>エピソード一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEpisodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedServiceId ? 'このサービスにはエピソードがありません' : 'サービスを選択してください'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>エピソード番号</TableHead>
                    <TableHead>タイトル</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>公開日</TableHead>
                    <TableHead>アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEpisodes.map((episode) => {
                    const service = services.find(s => s.id === episode.service_id);
                    return (
                      <TableRow key={episode.id}>
                        <TableCell className="font-medium">#{episode.ep_no}</TableCell>
                        <TableCell>{episode.title || '無題'}</TableCell>
                        <TableCell>{getStatusBadge(episode.status)}</TableCell>
                        <TableCell>
                          {episode.published_at 
                            ? new Date(episode.published_at).toLocaleDateString('ja-JP')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEpisode(episode)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (service) {
                                  const url = getPublicUrl({
                                    service: service.slug,
                                    epNo: episode.ep_no
                                  });
                                  copyToClipboard(url);
                                }
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (service) {
                                  const url = getPublicUrl({
                                    service: service.slug,
                                    epNo: episode.ep_no
                                  });
                                  window.open(url, '_blank');
                                }
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>エピソードを削除しますか？</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    この操作は取り消せません。エピソード「#{episode.ep_no}」を完全に削除します。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteEpisode(episode.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    削除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {editingEpisode && (
          <Dialog open={!!editingEpisode} onOpenChange={() => setEditingEpisode(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>エピソード編集</DialogTitle>
              </DialogHeader>
              <EpisodeForm
                service={selectedService}
                episode={editingEpisode}
                onSubmit={(data) => handleUpdateEpisode({ ...data, id: editingEpisode.id })}
                onCancel={() => setEditingEpisode(null)}
              />
            </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

interface EpisodeFormProps {
  service?: any;
  episode?: Episode | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const EpisodeForm = ({ service, episode, onSubmit, onCancel }: EpisodeFormProps) => {
  const [formData, setFormData] = useState({
    ep_no: episode?.ep_no || 1,
    title: episode?.title || '',
    default_platform: episode?.default_platform || service?.default_platform || 'NOTE' as AppPlatform,
    note_url: episode?.note_url || '',
    youtube_url: episode?.youtube_url || '',
    spotify_url: episode?.spotify_url || '',
    instagram_url: episode?.instagram_url || '',
    custom_url: episode?.custom_url || '',
    fallback_behavior: episode?.fallback_behavior || 'FALLBACK_TO_CHANNEL' as FallbackBehavior,
    status: episode?.status || 'DRAFT' as EpisodeStatus,
    published_at: episode?.published_at || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ep_no">エピソード番号</Label>
          <Input
            id="ep_no"
            type="number"
            min="1"
            value={formData.ep_no}
            onChange={(e) => setFormData(prev => ({ ...prev, ep_no: parseInt(e.target.value) }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="status">ステータス</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as EpisodeStatus }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">下書き</SelectItem>
              <SelectItem value="LIVE">公開中</SelectItem>
              <SelectItem value="ARCHIVED">アーカイブ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="エピソードのタイトル"
        />
      </div>

      <div>
        <Label htmlFor="default_platform">デフォルトプラットフォーム</Label>
        <Select value={formData.default_platform} onValueChange={(value) => setFormData(prev => ({ ...prev, default_platform: value as AppPlatform }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOTE">note</SelectItem>
            <SelectItem value="YOUTUBE">YouTube</SelectItem>
            <SelectItem value="SPOTIFY">Spotify</SelectItem>
            <SelectItem value="INSTAGRAM">Instagram</SelectItem>
            <SelectItem value="CUSTOM">カスタム</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>プラットフォーム別URL</Label>
        
        <div>
          <Label htmlFor="note_url" className="text-sm text-muted-foreground">note URL</Label>
          <Input
            id="note_url"
            value={formData.note_url}
            onChange={(e) => setFormData(prev => ({ ...prev, note_url: e.target.value }))}
            placeholder="https://note.com/..."
          />
        </div>
        
        <div>
          <Label htmlFor="youtube_url" className="text-sm text-muted-foreground">YouTube URL</Label>
          <Input
            id="youtube_url"
            value={formData.youtube_url}
            onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        
        <div>
          <Label htmlFor="spotify_url" className="text-sm text-muted-foreground">Spotify URL</Label>
          <Input
            id="spotify_url"
            value={formData.spotify_url}
            onChange={(e) => setFormData(prev => ({ ...prev, spotify_url: e.target.value }))}
            placeholder="https://open.spotify.com/episode/..."
          />
        </div>
        
        <div>
          <Label htmlFor="instagram_url" className="text-sm text-muted-foreground">Instagram URL</Label>
          <Input
            id="instagram_url"
            value={formData.instagram_url}
            onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
            placeholder="https://instagram.com/p/..."
          />
        </div>
        
        <div>
          <Label htmlFor="custom_url" className="text-sm text-muted-foreground">カスタム URL</Label>
          <Input
            id="custom_url"
            value={formData.custom_url}
            onChange={(e) => setFormData(prev => ({ ...prev, custom_url: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <Label htmlFor="fallback_behavior">フォールバック動作</Label>
        <Select value={formData.fallback_behavior} onValueChange={(value) => setFormData(prev => ({ ...prev, fallback_behavior: value as FallbackBehavior }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COMING_SOON">準備中ページを表示</SelectItem>
            <SelectItem value="FALLBACK_TO_CHANNEL">チャンネルにリダイレクト</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="published_at">公開日時</Label>
        <Input
          id="published_at"
          type="datetime-local"
          value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
          onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          {episode ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  );
};

export default Episodes;