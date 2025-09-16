import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Service, ServiceAlias, UserPlatform } from '@/types/database';
import { getPublicUrl } from '@/utils/url';

const aliasFormSchema = z.object({
  alias: z.string()
    .min(1, 'エイリアス名は必須です')
    .regex(/^[a-zA-Z0-9_-]+$/, 'エイリアス名は英数字、ハイフン、アンダースコアのみ使用できます'),
  redirect_url: z.string()
    .min(1, 'リダイレクトURLは必須です')
    .url('有効なURLを入力してください'),
  description: z.string().optional(),
  is_enabled: z.boolean().default(true),
});

type AliasFormData = z.infer<typeof aliasFormSchema>;

interface ServiceAliasFormProps {
  service: Service;
  alias?: ServiceAlias;
  userPlatforms: UserPlatform[];
  onSubmit: (data: AliasFormData) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const ServiceAliasForm: React.FC<ServiceAliasFormProps> = ({
  service,
  alias,
  userPlatforms,
  onSubmit,
  onCancel,
  isOpen,
}) => {
  const form = useForm<AliasFormData>({
    resolver: zodResolver(aliasFormSchema),
    defaultValues: {
      alias: alias?.alias || '',
      redirect_url: alias?.redirect_url || '',
      description: alias?.description || '',
      is_enabled: alias?.is_enabled ?? true,
    },
  });

  const watchedAlias = form.watch('alias');
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'example.com';

  const generatePreviewUrls = () => {
    if (!watchedAlias) return [];
    
    return userPlatforms
      .filter(p => p.is_enabled)
      .map(platform => ({
        platform: platform.platform_name,
        url: `https://${rootDomain}/${service.slug}/a/${watchedAlias}/${platform.platform_slug}`,
      }));
  };

  const handleSubmit = (data: AliasFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {alias ? 'サービスエイリアスを編集' : 'サービスエイリアスを作成'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>エイリアス名 *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="my-special-link" />
                  </FormControl>
                  <FormMessage />
                  {watchedAlias && (
                    <div className="text-sm text-muted-foreground">
                      プレビュー: <code className="bg-muted px-1 py-0.5 rounded">{service.slug}/a/{watchedAlias}</code>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="redirect_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>リダイレクトURL *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/target-page" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="このエイリアスの用途を説明してください" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>有効化</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedAlias && (
              <div className="space-y-3">
                <Label>生成されるURL（プラットフォーム別）</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {generatePreviewUrls().map(({ platform, url }) => (
                    <div key={platform} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="font-medium">{platform}:</span>
                      <code className="text-xs bg-background px-2 py-1 rounded">{url}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                キャンセル
              </Button>
              <Button type="submit">
                {alias ? '更新' : '作成'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};