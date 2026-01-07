import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Medicine {
  id: string;
  name_thai: string;
  name_english: string | null;
  properties: string | null;
  unit: string | null;
  stock_qty: number;
  created_at: string;
}

export const useMedicines = () => {
  return useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name_thai', { ascending: true });
      
      if (error) throw error;
      return data as Medicine[];
    }
  });
};

export const useMedicine = (id: string) => {
  return useQuery({
    queryKey: ['medicine', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Medicine | null;
    },
    enabled: !!id
  });
};
