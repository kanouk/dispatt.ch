import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useMemo } from "react";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/useServices";
import { useEpisodes, useCreateEpisode, useUpdateEpisode, useDeleteEpisode } from "@/hooks/useEpisodes";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Check, X, Search, ExternalLink, Copy, ChevronRight, ChevronDown } from "lucide-react";
import { getPublicUrl } from "@/utils/url";
import { PlatformIcon } from "@/components/ui/platform-icon";
import type { Service, Episode, AppPlatform, EpisodeStatus, FallbackBehavior, UserPlatform } from "@/types/database";

const Services = () => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEpisodeDialogOpen, setIsEpisodeDialogOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  
  const { data: services, isLoading } = useServices();
  const { data: userPlatforms = [] } = useUserPlatforms();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const { data: episodes = [] } = useEpisodes(selectedServiceId, searchQuery);
  const createEpisodeMutation = useCreateEpisode();
  const updateEpisodeMutation = useUpdateEpisode();
  const deleteEpisodeMutation = useDeleteEpisode();

  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<Partial<Service>>();

  const selectedService = services?.find(s => s.id === selectedServiceId);

  const filteredEpisodes = useMemo(() => {
    return episodes.filter(episode => 
      !selectedServiceId || episode.service_id === selectedServiceId
    );
  }, [episodes, selectedServiceId]);

  const onSubmitService = async (data: Partial<Service>) => {
    try {
      if (editingService) {
        await updateService.mutateAsync({ id: editingService.id, ...data });
        toast({ title: "サービスを更新しました" });
      } else {
        await createService.mutateAsync(data as Omit<Service, 'id' | 'created_at' | 'updated_at'>);
        toast({ title: "サービスを作成しました" });
      }
      setIsServiceDialogOpen(false);
      setEditingService(null);
      reset();
    } catch (error) {
      toast({ 
        title: "エラー", 
        description: "操作に失敗しました",
        variant: "destructive" 
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    Object.keys(service).forEach(key => {
      setValue(key as keyof Service, service[key as keyof Service]);
    });
    setIsServiceDialogOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('このサービスを削除してもよろしいですか？関連するエピソードも削除されます。')) {
      try {
        await deleteService.mutateAsync(id);
        toast({ title: "サービスを削除しました" });
        if (selectedServiceId === id) {
          setSelectedServiceId('');
        }
      } catch (error) {
        toast({ 
          title: "エラー", 
          description: "削除に失敗しました",
          variant: "destructive" 
        });
      }
    }
  };

  const handleServiceDialogClose = () => {
    setIsServiceDialogOpen(false);
    setEditingService(null);
    reset();
  };

  // Episode handlers
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
      setIsEpisodeDialogOpen(false);
      toast({
        title: "エピソード作成完了",
        description: "エピソードが正常に作成されました。",
      });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message || "エピソードの作成に失敗しました。",
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
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message || "エピソードの更新に失敗しました。",
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

  const getPlatformLabel = (platform: AppPlatform, customPlatformId?: string) => {
     const configs = {
       NOTE: { icon: 'FaStickyNote', label: 'Note', color: '#41C9B4' },
       YOUTUBE: { icon: 'FaYoutube', label: 'YouTube', color: '#FF0000' },
       SPOTIFY: { icon: 'FaSpotify', label: 'Spotify', color: '#1DB954' },
       INSTAGRAM: { icon: 'FaInstagram', label: 'Instagram', color: '#E4405F' },
       TIKTOK: { icon: 'FaTiktok', label: 'TikTok', color: '#000000' },
       APPLEPODCASTS: { icon: 'SiApplepodcasts', label: 'Apple Podcasts', color: '#9933CC' },
       CUSTOM: { icon: 'FaGlobe', label: 'Custom', color: '#6B7280' }
     };
    
    // カスタムプラットフォームの場合、ユーザー設定を使用
    if (platform === 'CUSTOM' && customPlatformId) {
      const customPlatform = userPlatforms.find(p => p.id === customPlatformId);
      if (customPlatform) {
        return (
          <span className="flex items-center gap-1">
            <PlatformIcon 
              iconName={customPlatform.platform_icon || 'FaGlobe'} 
              size={16} 
              color={customPlatform.platform_color || '#6B7280'}
            />
            {customPlatform.platform_name}
          </span>
        );
      }
    }
    
    const config = configs[platform];
    return (
      <span className="flex items-center gap-1">
        <PlatformIcon iconName={config.icon} size={16} color={config.color} />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-primary">🎬 サービス・エピソード管理</h1>
          <p className="text-muted-foreground">
            ✨ 短縮URL用のサービスとエピソードを管理
          </p>
        </div>
        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Plus className="h-4 w-4 mr-2" />
              ✨ 新規サービス
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'サービス編集' : '新規サービス作成'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmitService)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">サービス名</Label>
                  <Input 
                    id="name"
                    {...register("name", { 
                      required: "サービス名は必須です",
                      maxLength: { value: 50, message: "50文字以内で入力してください" }
                    })}
                    placeholder="例: Perfume Radio"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="slug">スラッグ</Label>
                  <Input 
                    id="slug"
                    {...register("slug", { 
                      required: "スラッグは必須です",
                      pattern: {
                        value: /^[a-zA-Z0-9-]+$/,
                        message: "英数字とハイフンのみ使用可能です"
                      },
                      maxLength: { value: 32, message: "32文字以内で入力してください" }
                    })}
                    placeholder="例: perfume"
                  />
                  {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="default_platform">既定プラットフォーム</Label>
                <Select 
                  value={watch('default_platform')} 
                  onValueChange={(value) => setValue('default_platform', value as AppPlatform)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="プラットフォームを選択" />
                  </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="NOTE">
                       <span className="flex items-center gap-2">
                         <PlatformIcon iconName="FaStickyNote" size={16} color="#41C9B4" />
                         note
                       </span>
                     </SelectItem>
                     <SelectItem value="YOUTUBE">
                       <span className="flex items-center gap-2">
                         <PlatformIcon iconName="FaYoutube" size={16} color="#FF0000" />
                         YouTube
                       </span>
                     </SelectItem>
                     <SelectItem value="SPOTIFY">
                       <span className="flex items-center gap-2">
                         <PlatformIcon iconName="FaSpotify" size={16} color="#1DB954" />
                         Spotify
                       </span>
                     </SelectItem>
                     <SelectItem value="INSTAGRAM">
                       <span className="flex items-center gap-2">
                         <PlatformIcon iconName="FaInstagram" size={16} color="#E4405F" />
                         Instagram
                       </span>
                     </SelectItem>
                     <SelectItem value="TIKTOK">
                       <span className="flex items-center gap-2">
                         <PlatformIcon iconName="FaTiktok" size={16} color="#000000" />
                         TikTok
                       </span>
                     </SelectItem>
                     <SelectItem value="APPLEPODCASTS">
                       <span className="flex items-center gap-2">
                         <PlatformIcon iconName="SiApplepodcasts" size={16} color="#9933CC" />
                         Apple Podcasts
                       </span>
                     </SelectItem>
                     {userPlatforms.map((platform) => (
                       <SelectItem key={`custom-${platform.id}`} value="CUSTOM">
                         <span className="flex items-center gap-2">
                           <PlatformIcon 
                             iconName={platform.platform_icon || 'FaGlobe'} 
                             size={16} 
                             color={platform.platform_color || '#6B7280'}
                           />
                           {platform.platform_name}
                         </span>
                       </SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">チャンネルトップURL</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="note_home_url">Note URL</Label>
                    <Input 
                      id="note_home_url"
                      {...register("note_home_url", {
                        pattern: {
                          value: /^https:\/\/.+/,
                          message: "https://で始まる正しいURLを入力してください"
                        }
                      })}
                      placeholder="https://note.com/user"
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtube_channel_url">YouTube URL</Label>
                    <Input 
                      id="youtube_channel_url"
                      {...register("youtube_channel_url", {
                        pattern: {
                          value: /^https:\/\/.+/,
                          message: "https://で始まる正しいURLを入力してください"
                        }
                      })}
                      placeholder="https://youtube.com/@channel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spotify_show_url">Spotify URL</Label>
                    <Input 
                      id="spotify_show_url"
                      {...register("spotify_show_url", {
                        pattern: {
                          value: /^https:\/\/.+/,
                          message: "https://で始まる正しいURLを入力してください"
                        }
                      })}
                      placeholder="https://open.spotify.com/show/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram_profile_url">Instagram URL</Label>
                    <Input 
                      id="instagram_profile_url"
                      {...register("instagram_profile_url", {
                        pattern: {
                          value: /^https:\/\/.+/,
                          message: "https://で始まる正しいURLを入力してください"
                        }
                      })}
                      placeholder="https://instagram.com/user"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok_profile_url">TikTok URL</Label>
                    <Input 
                      id="tiktok_profile_url"
                      {...register("tiktok_profile_url", {
                        pattern: {
                          value: /^https:\/\/.+/,
                          message: "https://で始まる正しいURLを入力してください"
                        }
                      })}
                      placeholder="https://tiktok.com/@user"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apple_podcasts_url">Apple Podcasts URL</Label>
                    <Input 
                      id="apple_podcasts_url"
                      {...register("apple_podcasts_url", {
                        pattern: {
                          value: /^https:\/\/.+/,
                          message: "https://で始まる正しいURLを入力してください"
                        }
                      })}
                      placeholder="https://podcasts.apple.com/podcast/id..."
                    />
                   </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleServiceDialogClose}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={createService.isPending || updateService.isPending}>
                  {createService.isPending || updateService.isPending ? '保存中...' : '保存'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services List */}
      <div className="grid gap-4 mb-8">
        {services?.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedServiceId(selectedServiceId === service.id ? '' : service.id)}
                  >
                    {selectedServiceId === service.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      slug: {service.slug} | 既定: {getPlatformLabel(service.default_platform)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {service.note_home_url && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    <PlatformIcon iconName="FaStickyNote" size={12} />
                    Note <Check className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {service.youtube_channel_url && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1">
                    <PlatformIcon iconName="FaYoutube" size={12} />
                    YouTube <Check className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {service.spotify_show_url && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                    <PlatformIcon iconName="FaSpotify" size={12} />
                    Spotify <Check className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {service.instagram_profile_url && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 flex items-center gap-1">
                    <PlatformIcon iconName="FaInstagram" size={12} />
                    Instagram <Check className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {service.tiktok_profile_url && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 flex items-center gap-1">
                    <PlatformIcon iconName="FaTiktok" size={12} />
                    TikTok <Check className="h-3 w-3 ml-1" />
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!services?.length && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                まだサービスが登録されていません。「新規サービス」ボタンから追加してください。
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Episode Management Section */}
      {selectedServiceId && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">🎯 エピソード管理</h2>
              <p className="text-muted-foreground">
                ✨ 「{selectedService?.name}」のエピソードを管理
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="エピソード番号またはタイトルで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={isEpisodeDialogOpen} onOpenChange={setIsEpisodeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <Plus className="h-4 w-4 mr-2" />
                  🎬 エピソード作成
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新規エピソード作成</DialogTitle>
                </DialogHeader>
                <EpisodeForm
                  service={selectedService}
                  userPlatforms={userPlatforms}
                  onSubmit={(data) => handleCreateEpisode({ ...data, service_id: selectedServiceId })}
                  onCancel={() => setIsEpisodeDialogOpen(false)}
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
                  このサービスにはエピソードがありません
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>エピソード番号</TableHead>
                      <TableHead>タイトル</TableHead>
                      <TableHead>プラットフォーム</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>公開日</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEpisodes.map((episode) => (
                      <TableRow key={episode.id}>
                        <TableCell className="font-medium">#{episode.ep_no}</TableCell>
                        <TableCell>{episode.title || '無題'}</TableCell>
                        <TableCell>{getPlatformLabel(episode.default_platform, episode.custom_platform_id)}</TableCell>
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
                                if (selectedService) {
                                  const url = getPublicUrl({
                                    service: selectedService.slug,
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
                                if (selectedService) {
                                  const url = getPublicUrl({
                                    service: selectedService.slug,
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {editingEpisode && (
        <Dialog open={!!editingEpisode} onOpenChange={() => setEditingEpisode(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>エピソード編集</DialogTitle>
            </DialogHeader>
            <EpisodeForm
              service={selectedService}
              episode={editingEpisode}
              userPlatforms={userPlatforms}
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
  service?: Service;
  episode?: Episode | null;
  userPlatforms?: UserPlatform[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const EpisodeForm = ({ service, episode, userPlatforms = [], onSubmit, onCancel }: EpisodeFormProps) => {
  const { toast } = useToast();
   const [formData, setFormData] = useState({
     ep_no: episode?.ep_no || 1,
     title: episode?.title || '',
     default_platform: episode?.default_platform || service?.default_platform || 'NOTE' as AppPlatform,
     note_url: episode?.note_url || '',
     youtube_url: episode?.youtube_url || '',
     spotify_url: episode?.spotify_url || '',
     instagram_url: episode?.instagram_url || '',
     apple_podcasts_url: episode?.apple_podcasts_url || '',
    custom_url: episode?.custom_url || '',
     custom_platform_id: episode?.custom_platform_id || '',
     fallback_behavior: episode?.fallback_behavior || 'FALLBACK_TO_CHANNEL' as FallbackBehavior,
     status: episode?.status || 'DRAFT' as EpisodeStatus,
     published_at: episode?.published_at || null,
   });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // カスタムプラットフォームのバリデーション
    if (formData.default_platform === 'CUSTOM') {
      if (!formData.custom_platform_id) {
        toast({
          title: "エラー",
          description: "カスタムプラットフォームを選択してください",
          variant: "destructive",
        });
        return;
      }
      if (!formData.custom_url.trim()) {
        toast({
          title: "エラー",
          description: "カスタムURLは必須です",
          variant: "destructive",
        });
        return;
      }
    }
    
     // 空文字列をnullに変換
     const cleanedData = {
       ...formData,
       title: formData.title.trim() || null,
       note_url: formData.note_url.trim() || null,
       youtube_url: formData.youtube_url.trim() || null,
       spotify_url: formData.spotify_url.trim() || null,
       instagram_url: formData.instagram_url.trim() || null,
       apple_podcasts_url: formData.apple_podcasts_url.trim() || null,
      custom_url: formData.custom_url.trim() || null,
       custom_platform_id: formData.custom_platform_id || null,
       published_at: formData.published_at === '' ? null : formData.published_at
     };
    onSubmit(cleanedData);
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
        <Select value={formData.default_platform} onValueChange={(value) => {
          setFormData(prev => ({ 
            ...prev, 
            default_platform: value as AppPlatform,
            custom_platform_id: value === 'CUSTOM' ? '' : prev.custom_platform_id
          }));
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOTE">
              <span className="flex items-center gap-2">
                <PlatformIcon iconName="FaStickyNote" size={16} color="#41C9B4" />
                note
              </span>
            </SelectItem>
            <SelectItem value="YOUTUBE">
              <span className="flex items-center gap-2">
                <PlatformIcon iconName="FaYoutube" size={16} color="#FF0000" />
                YouTube
              </span>
            </SelectItem>
            <SelectItem value="SPOTIFY">
              <span className="flex items-center gap-2">
                <PlatformIcon iconName="FaSpotify" size={16} color="#1DB954" />
                Spotify
              </span>
            </SelectItem>
            <SelectItem value="INSTAGRAM">
              <span className="flex items-center gap-2">
                <PlatformIcon iconName="FaInstagram" size={16} color="#E4405F" />
                Instagram
              </span>
            </SelectItem>
            <SelectItem value="TIKTOK">
              <span className="flex items-center gap-2">
                <PlatformIcon iconName="FaTiktok" size={16} color="#000000" />
                TikTok
              </span>
            </SelectItem>
            <SelectItem value="APPLEPODCASTS">
              <span className="flex items-center gap-2">
                <PlatformIcon iconName="SiApplepodcasts" size={16} color="#9933CC" />
                Apple Podcasts
              </span>
            </SelectItem>
            <SelectItem value="CUSTOM">
              <span className="flex items-center gap-2">
                <PlatformIcon iconName="FaGlobe" size={16} color="#6B7280" />
                カスタム
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.default_platform === 'CUSTOM' && (
        <div>
          <Label htmlFor="custom_platform_id">カスタムプラットフォーム</Label>
          <Select value={formData.custom_platform_id} onValueChange={(value) => {
            const selectedPlatform = userPlatforms.find(p => p.id === value);
            setFormData(prev => ({ 
              ...prev, 
              custom_platform_id: value,
              custom_url: selectedPlatform?.url_template ? 
                selectedPlatform.url_template.replace('{username}', '').replace('{show_id}', '') : 
                prev.custom_url
            }));
          }}>
            <SelectTrigger>
              <SelectValue placeholder="カスタムプラットフォームを選択" />
            </SelectTrigger>
            <SelectContent>
              {userPlatforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  <span className="flex items-center gap-2">
                    <PlatformIcon 
                      iconName={platform.platform_icon || 'FaGlobe'} 
                      size={16} 
                      color={platform.platform_color || '#6B7280'}
                    />
                    {platform.platform_name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
          <Label htmlFor="apple_podcasts_url" className="text-sm text-muted-foreground">Apple Podcasts URL</Label>
          <Input
            id="apple_podcasts_url"
            value={formData.apple_podcasts_url}
            onChange={(e) => setFormData(prev => ({ ...prev, apple_podcasts_url: e.target.value }))}
            placeholder="https://podcasts.apple.com/podcast/id..."
          />
        </div>
        
        {formData.default_platform === 'CUSTOM' && (
          <div>
            <Label htmlFor="custom_url" className="text-sm text-muted-foreground">
              カスタム URL
              {formData.custom_platform_id && (() => {
                const platform = userPlatforms.find(p => p.id === formData.custom_platform_id);
                return platform?.url_template ? (
                  <span className="text-xs text-muted-foreground ml-2">
                    (テンプレート: {platform.url_template})
                  </span>
                ) : null;
              })()}
            </Label>
            <Input
              id="custom_url"
              value={formData.custom_url}
              onChange={(e) => setFormData(prev => ({ ...prev, custom_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="fallback_behavior">フォールバック動作</Label>
        <Select value={formData.fallback_behavior} onValueChange={(value) => setFormData(prev => ({ ...prev, fallback_behavior: value as FallbackBehavior }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FALLBACK_TO_CHANNEL">チャンネルトップへ</SelectItem>
            <SelectItem value="COMING_SOON">カミングスーン</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
};

export default Services;