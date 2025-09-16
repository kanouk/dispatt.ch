import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Episode } from '@/types/database';

export const useEpisodes = (serviceId?: string, search?: string) => {
  return useQuery({
    queryKey: ['episodes', serviceId, search],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      let query = supabase
        .from('episodes')
        .select(`
          *,
          services!inner(name, slug)
        `)
        .eq('user_id', user.id);
      
      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }
      
      if (search) {
        const isNumeric = /^\d+$/.test(search);
        if (isNumeric) {
          query = query.eq('ep_no', parseInt(search));
        } else {
          // Search by title or alias
          query = query.or(`title.ilike.%${search}%,alias.ilike.%${search}%`);
        }
      }
      
      const { data, error } = await query.order('ep_no', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateEpisode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (episode: Omit<Episode, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      // 空文字列をnullに正規化
      const normalizedEpisode = {
        ...episode,
        title: episode.title?.trim() || null,
        alias: episode.alias?.trim() || null,
        custom_url: episode.custom_url?.trim() || null,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };
      
      const { data, error } = await supabase
        .from('episodes')
        .insert(normalizedEpisode)
        .select()
        .single();
      
      if (error) {
        // カスタムエラーメッセージ
        if (error.code === '23505' && error.message.includes('episodes_service_id_ep_no_key')) {
          throw new Error('このエピソード番号は既に存在します');
        }
        if (error.code === '23505' && error.message.includes('episodes_service_alias_unique')) {
          throw new Error('このエイリアスは既に存在します');
        }
        if (error.message.includes('valid_custom_url')) {
          throw new Error('カスタムURL形式が正しくありません');
        }
        throw error;
      }
      return data as Episode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
    },
  });
};

export const useUpdateEpisode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Episode> & { id: string }) => {
      // 空文字列をnullに正規化
      const normalizedUpdates = {
        ...updates,
        title: updates.title?.trim() || null,
        alias: updates.alias?.trim() || null,
        custom_url: updates.custom_url?.trim() || null,
      };
      
      const { data, error } = await supabase
        .from('episodes')
        .update(normalizedUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // カスタムエラーメッセージ
        if (error.code === '23505' && error.message.includes('episodes_service_id_ep_no_key')) {
          throw new Error('このエピソード番号は既に存在します');
        }
        if (error.code === '23505' && error.message.includes('episodes_service_alias_unique')) {
          throw new Error('このエイリアスは既に存在します');
        }
        if (error.message.includes('valid_custom_url')) {
          throw new Error('カスタムURL形式が正しくありません');
        }
        throw error;
      }
      return data as Episode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
    },
  });
};

export const useDeleteEpisode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
    },
  });
};