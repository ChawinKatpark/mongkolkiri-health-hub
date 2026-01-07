import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProcedureOrder {
  id: string;
  visit_id: string;
  procedure_name: string;
  body_part: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
}

export interface CreateProcedureOrderInput {
  visit_id: string;
  procedure_name: string;
  body_part?: string;
  notes?: string;
  status?: string;
}

export const useProcedureOrders = (visitId?: string) => {
  return useQuery({
    queryKey: ['procedure-orders', visitId],
    queryFn: async () => {
      let query = supabase.from('procedure_orders').select('*');
      
      if (visitId) {
        query = query.eq('visit_id', visitId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProcedureOrder[];
    },
    enabled: visitId ? !!visitId : true
  });
};

export const useCreateProcedureOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProcedureOrderInput) => {
      const { data, error } = await supabase
        .from('procedure_orders')
        .insert({
          visit_id: input.visit_id,
          procedure_name: input.procedure_name,
          body_part: input.body_part || null,
          notes: input.notes || null,
          status: input.status || 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProcedureOrder;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['procedure-orders', variables.visit_id] });
      toast.success('บันทึกหัตถการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};

export const useUpdateProcedureStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, visitId }: { id: string; status: string; visitId: string }) => {
      const { data, error } = await supabase
        .from('procedure_orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, visitId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['procedure-orders', result.visitId] });
      toast.success('อัพเดทสถานะหัตถการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};

export const useDeleteProcedureOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, visitId }: { id: string; visitId: string }) => {
      const { error } = await supabase
        .from('procedure_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, visitId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['procedure-orders', variables.visitId] });
      toast.success('ลบหัตถการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};
