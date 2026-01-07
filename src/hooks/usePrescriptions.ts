import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Prescription {
  id: string;
  visit_id: string;
  medicine_id: string;
  quantity: number;
  usage_instruction: string | null;
  created_at: string;
  medicine?: {
    id: string;
    name_thai: string;
    name_english: string | null;
    unit: string | null;
  };
}

export interface CreatePrescriptionInput {
  visit_id: string;
  medicine_id: string;
  quantity: number;
  usage_instruction?: string;
}

export const usePrescriptions = (visitId?: string) => {
  return useQuery({
    queryKey: ['prescriptions', visitId],
    queryFn: async () => {
      let query = supabase
        .from('prescriptions')
        .select(`
          *,
          medicine:medicines(id, name_thai, name_english, unit)
        `);
      
      if (visitId) {
        query = query.eq('visit_id', visitId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Prescription[];
    },
    enabled: visitId ? !!visitId : true
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePrescriptionInput) => {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          visit_id: input.visit_id,
          medicine_id: input.medicine_id,
          quantity: input.quantity,
          usage_instruction: input.usage_instruction || null
        })
        .select()
        .single();

      if (error) throw error;
      return data as Prescription;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', variables.visit_id] });
      toast.success('บันทึกคำสั่งยาสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};

export const useDeletePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, visitId }: { id: string; visitId: string }) => {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, visitId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', variables.visitId] });
      toast.success('ลบคำสั่งยาสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};
