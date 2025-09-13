import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsFilters {
  serviceId?: string;
  epNo?: number;
  variant?: string;
  startDate?: string;
  endDate?: string;
  excludeBots?: boolean;
}

export const useAnalytics = (filters: AnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      let query = supabase
        .from('clicks')
        .select(`
          *,
          services!inner(name, slug)
        `);
      
      if (filters.serviceId) {
        query = query.eq('service_id', filters.serviceId);
      }
      
      if (filters.epNo) {
        query = query.eq('ep_no', filters.epNo);
      }
      
      if (filters.variant) {
        query = query.eq('variant', filters.variant);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      if (filters.excludeBots) {
        query = query.eq('is_bot', false);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAnalyticsSummary = (filters: AnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ['analytics-summary', filters],
    queryFn: async () => {
      // Get total clicks
      let query = supabase
        .from('clicks')
        .select('id', { count: 'exact' });
      
      // Apply filters
      if (filters.serviceId) query = query.eq('service_id', filters.serviceId);
      if (filters.epNo) query = query.eq('ep_no', filters.epNo);
      if (filters.variant) query = query.eq('variant', filters.variant);
      if (filters.startDate) query = query.gte('created_at', filters.startDate);
      if (filters.endDate) query = query.lte('created_at', filters.endDate);
      if (filters.excludeBots) query = query.eq('is_bot', false);
      
      const { count: totalClicks, error } = await query;
      
      if (error) throw error;
      
      // Calculate unique clicks (simplified - by ip_hash + user_agent + ep_no + variant per day)
      const uniqueQuery = supabase
        .from('clicks')
        .select('ip_hash, user_agent, ep_no, variant, created_at');
      
      // Apply same filters for unique calculation
      if (filters.serviceId) uniqueQuery.eq('service_id', filters.serviceId);
      if (filters.epNo) uniqueQuery.eq('ep_no', filters.epNo);
      if (filters.variant) uniqueQuery.eq('variant', filters.variant);
      if (filters.startDate) uniqueQuery.gte('created_at', filters.startDate);
      if (filters.endDate) uniqueQuery.lte('created_at', filters.endDate);
      if (filters.excludeBots) uniqueQuery.eq('is_bot', false);
      
      const { data: uniqueData } = await uniqueQuery;
      
      // Calculate unique clicks by day
      const uniqueByDay = new Set<string>();
      uniqueData?.forEach(click => {
        const day = new Date(click.created_at).toISOString().split('T')[0];
        const key = `${day}-${click.ip_hash}-${click.user_agent}-${click.ep_no}-${click.variant}`;
        uniqueByDay.add(key);
      });
      
      return {
        totalClicks: totalClicks || 0,
        uniqueClicks: uniqueByDay.size,
      };
    },
  });
};