import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ServiceAlias } from '@/types/database';

export const useServiceAliases = (serviceId?: string) => {
  return useQuery({
    queryKey: ['service-aliases', serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('service_aliases')
        .select('*')
        .eq('service_id', serviceId)
        .eq('user_id', user.id)
        .order('alias');
      
      if (error) throw error;
      return data as ServiceAlias[];
    },
    enabled: !!serviceId,
  });
};

export const useCreateServiceAlias = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alias: Omit<ServiceAlias, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('service_aliases')
        .insert({
          ...alias,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ServiceAlias;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-aliases', variables.service_id] });
    },
  });
};

export const useUpdateServiceAlias = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, service_id, ...updates }: Partial<ServiceAlias> & { id: string; service_id: string }) => {
      const { data, error } = await supabase
        .from('service_aliases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ServiceAlias;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-aliases', variables.service_id] });
    },
  });
};

export const useDeleteServiceAlias = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, service_id }: { id: string; service_id: string }) => {
      const { error } = await supabase
        .from('service_aliases')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-aliases', variables.service_id] });
    },
  });
};