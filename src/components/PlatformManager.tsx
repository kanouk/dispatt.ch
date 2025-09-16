import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAllUserPlatforms, useCreateUserPlatform, useUpdateUserPlatform, useDeleteUserPlatform, useCreateDefaultPlatforms } from '@/hooks/useUserPlatforms';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlatformIcon } from '@/components/ui/platform-icon';
import { IconSelector } from '@/components/ui/icon-selector';
import type { UserPlatform } from '@/types/database';

interface PlatformFormData {
  platform_name: string;
  platform_slug: string;
  platform_icon?: string;
  platform_color?: string;
  url_template?: string;
  is_enabled: boolean;
  display_order: number;
}

export const PlatformManager = () => {
  const { data: platforms = [], isLoading } = useAllUserPlatforms();
  const createMutation = useCreateUserPlatform();
  const updateMutation = useUpdateUserPlatform();
  const deleteMutation = useDeleteUserPlatform();
  const createDefaultMutation = useCreateDefaultPlatforms();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<UserPlatform | null>(null);
  const [formData, setFormData] = useState<PlatformFormData>({
    platform_name: '',
    platform_slug: '',
    platform_icon: '',
    platform_color: '#000000',
    url_template: '',
    is_enabled: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      platform_name: '',
      platform_slug: '',
      platform_icon: '',
      platform_color: '#000000',
      url_template: '',
      is_enabled: true,
      display_order: platforms.length,
    });
  };


  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "プラットフォームを作成しました",
        description: `${formData.platform_name}が追加されました。`,
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "プラットフォームの作成に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingPlatform) return;
    
    try {
      await updateMutation.mutateAsync({ id: editingPlatform.id, ...formData });
      setEditingPlatform(null);
      resetForm();
      toast({
        title: "プラットフォームを更新しました",
        description: `${formData.platform_name}が更新されました。`,
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "プラットフォームの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (platform: UserPlatform) => {
    if (!confirm(`${platform.platform_name}を削除しますか？`)) return;
    
    try {
      await deleteMutation.mutateAsync(platform.id);
      toast({
        title: "プラットフォームを削除しました",
        description: `${platform.platform_name}が削除されました。`,
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "プラットフォームの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (platform: UserPlatform) => {
    setEditingPlatform(platform);
    setFormData({
      platform_name: platform.platform_name,
      platform_slug: platform.platform_slug,
      platform_icon: platform.platform_icon || '',
      platform_color: platform.platform_color || '#000000',
      url_template: platform.url_template || '',
      is_enabled: platform.is_enabled,
      display_order: platform.display_order,
    });
  };

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, platform_name: e.target.value }));
  }, []);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, platform_slug: e.target.value.toLowerCase() }));
  }, []);

  const handleIconChange = useCallback((iconName: string, iconColor: string, iconLabel: string) => {
    setFormData(prev => ({ 
      ...prev, 
      platform_icon: iconName,
      platform_color: iconColor,
      platform_name: prev.platform_name || iconLabel
    }));
  }, []);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, platform_color: e.target.value }));
  }, []);

  const handleUrlTemplateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, url_template: e.target.value }));
  }, []);

  const handleEnabledChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, is_enabled: checked }));
  }, []);

  const PlatformForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="platform_name">プラットフォーム名</Label>
        <Input
          id="platform_name"
          value={formData.platform_name}
          onChange={handleNameChange}
          placeholder="例: TikTok"
        />
      </div>
      
      <div>
        <Label htmlFor="platform_slug">スラッグ</Label>
        <Input
          id="platform_slug"
          value={formData.platform_slug}
          onChange={handleSlugChange}
          placeholder="例: tiktok"
        />
      </div>
      
      <IconSelector
        value={formData.platform_icon}
        onChange={handleIconChange}
      />
      
      <div>
        <Label htmlFor="platform_color">カラー</Label>
        <Input
          id="platform_color"
          type="color"
          value={formData.platform_color}
          onChange={handleColorChange}
        />
      </div>
      
      <div>
        <Label htmlFor="url_template">URLテンプレート（オプション）</Label>
        <Input
          id="url_template"
          value={formData.url_template}
          onChange={handleUrlTemplateChange}
          placeholder="例: https://tiktok.com/@username"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is_enabled"
          checked={formData.is_enabled}
          onCheckedChange={handleEnabledChange}
        />
        <Label htmlFor="is_enabled">有効</Label>
      </div>
      
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">プラットフォーム管理</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              新規プラットフォーム
            </Button>
          </DialogTrigger>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>新しいプラットフォームを作成</DialogTitle>
            </DialogHeader>
            <PlatformForm onSubmit={handleCreate} submitLabel="作成" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center space-x-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <PlatformIcon 
                  iconName={platform.platform_icon || 'FaGlobe'} 
                  size={20}
                  color={platform.platform_color || 'currentColor'}
                />
                <span>{platform.platform_name}</span>
                <span className="text-sm text-muted-foreground">({platform.platform_slug})</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Switch checked={platform.is_enabled} disabled />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(platform)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(platform)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            {platform.url_template && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  URL: {platform.url_template}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPlatform} onOpenChange={(open) => !open && setEditingPlatform(null)}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>プラットフォームを編集</DialogTitle>
          </DialogHeader>
          <PlatformForm onSubmit={handleUpdate} submitLabel="更新" />
        </DialogContent>
      </Dialog>
    </div>
  );
};