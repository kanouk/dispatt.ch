import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/useServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import type { Service, AppPlatform } from "@/types/database";

const Services = () => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: services, isLoading } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<Partial<Service>>();

  const onSubmit = async (data: Partial<Service>) => {
    try {
      if (editingService) {
        await updateService.mutateAsync({ id: editingService.id, ...data });
        toast({ title: "サービスを更新しました" });
      } else {
        await createService.mutateAsync(data as Omit<Service, 'id' | 'created_at' | 'updated_at'>);
        toast({ title: "サービスを作成しました" });
      }
      setIsDialogOpen(false);
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

  const handleEdit = (service: Service) => {
    setEditingService(service);
    Object.keys(service).forEach(key => {
      setValue(key as keyof Service, service[key as keyof Service]);
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('このサービスを削除してもよろしいですか？関連するエピソードも削除されます。')) {
      try {
        await deleteService.mutateAsync(id);
        toast({ title: "サービスを削除しました" });
      } catch (error) {
        toast({ 
          title: "エラー", 
          description: "削除に失敗しました",
          variant: "destructive" 
        });
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    reset();
  };

  const platformLabels = {
    NOTE: 'Note',
    YOUTUBE: 'YouTube',
    SPOTIFY: 'Spotify',
    INSTAGRAM: 'Instagram',
    CUSTOM: 'Custom'
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
          <h1 className="text-3xl font-bold mb-2">サービス設定</h1>
          <p className="text-muted-foreground">
            短縮URL用のサービス（ポッドキャスト等）を管理
          </p>
        </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    新規サービス
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? 'サービス編集' : '新規サービス作成'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      <Select onValueChange={(value) => setValue('default_platform', value as AppPlatform)}>
                        <SelectTrigger>
                          <SelectValue placeholder="プラットフォームを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(platformLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
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
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
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
            <div className="grid gap-4">
              {services?.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          slug: {service.slug} | 既定: {platformLabels[service.default_platform]}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {service.note_home_url && <Badge variant="secondary">Note <Check className="h-3 w-3 ml-1" /></Badge>}
                      {service.youtube_channel_url && <Badge variant="secondary">YouTube <Check className="h-3 w-3 ml-1" /></Badge>}
                      {service.spotify_show_url && <Badge variant="secondary">Spotify <Check className="h-3 w-3 ml-1" /></Badge>}
                      {service.instagram_profile_url && <Badge variant="secondary">Instagram <Check className="h-3 w-3 ml-1" /></Badge>}
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
    </AdminLayout>
  );
};

export default Services;