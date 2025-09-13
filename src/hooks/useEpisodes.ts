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
    mutationFn: async (episode: Omit<Episode, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('episodes')
        .insert(episode)
        .select()
        .single();
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('episodes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
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