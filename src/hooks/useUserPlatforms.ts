import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserPlatform } from '@/types/database';

export const useUserPlatforms = () => {
  return useQuery({
    queryKey: ['user-platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_platforms')
        .select('*')
        .eq('is_enabled', true)
        .order('display_order');
      
      if (error) throw error;
      return data as UserPlatform[];
    },
  });
};

export const useAllUserPlatforms = () => {
  return useQuery({
    queryKey: ['user-platforms-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_platforms')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as UserPlatform[];
    },
  });
};

export const useCreateUserPlatform = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (platform: Omit<UserPlatform, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('user_platforms')
        .insert({
          ...platform,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as UserPlatform;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['user-platforms-all'] });
    },
  });
};

export const useUpdateUserPlatform = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserPlatform> & { id: string }) => {
      const { data, error } = await supabase
        .from('user_platforms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as UserPlatform;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['user-platforms-all'] });
    },
  });
};

export const useDeleteUserPlatform = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_platforms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['user-platforms-all'] });
    },
  });
};