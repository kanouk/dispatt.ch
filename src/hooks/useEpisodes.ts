import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Episode } from '@/types/database';

export const useEpisodes = (serviceId?: string, search?: string) => {
  return useQuery({
    queryKey: ['episodes', serviceId, search],
    queryFn: async () => {
      let query = supabase
        .from('episodes')
        .select(`
          *,
          services!inner(name, slug)
        `);
      
      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }
      
      if (search) {
        const isNumeric = /^\d+$/.test(search);
        if (isNumeric) {
          query = query.eq('ep_no', parseInt(search));
        } else {
          query = query.ilike('title', `%${search}%`);
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
        note_url: episode.note_url?.trim() || null,
        youtube_url: episode.youtube_url?.trim() || null,
        spotify_url: episode.spotify_url?.trim() || null,
        instagram_url: episode.instagram_url?.trim() || null,
        apple_podcasts_url: episode.apple_podcasts_url?.trim() || null,
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
        note_url: updates.note_url?.trim() || null,
        youtube_url: updates.youtube_url?.trim() || null,
        spotify_url: updates.spotify_url?.trim() || null,
        instagram_url: updates.instagram_url?.trim() || null,
        apple_podcasts_url: updates.apple_podcasts_url?.trim() || null,
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