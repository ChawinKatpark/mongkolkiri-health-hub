import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TreatmentPlan {
  id: string;
  visit_id: string;
  plan_details: string;
  duration: string | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTreatmentPlanInput {
  visit_id: string;
  plan_details: string;
  duration?: string;
  follow_up_date?: string;
  notes?: string;
}

export const useTreatmentPlans = (visitId?: string) => {
  return useQuery({
    queryKey: ['treatment-plans', visitId],
    queryFn: async () => {
      let query = supabase.from('treatment_plans').select('*');
      
      if (visitId) {
        query = query.eq('visit_id', visitId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TreatmentPlan[];
    },
    enabled: visitId ? !!visitId : true
  });
};

export const useCreateTreatmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTreatmentPlanInput) => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .insert({
          visit_id: input.visit_id,
          plan_details: input.plan_details,
          duration: input.duration || null,
          follow_up_date: input.follow_up_date || null,
          notes: input.notes || null
        })
        .select()
        .single();

      if (error) throw error;
      return data as TreatmentPlan;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans', variables.visit_id] });
      toast.success('บันทึกแผนการรักษาสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};

export const useUpdateTreatmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, visitId, ...updates }: Partial<CreateTreatmentPlanInput> & { id: string; visitId: string }) => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, visitId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans', result.visitId] });
      toast.success('อัพเดทแผนการรักษาสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};

export const useDeleteTreatmentPlan = () => {
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
      queryClient.invalidateQueries({ queryKey: ['treatment-plans', variables.visitId] });
      toast.success('ลบแผนการรักษาสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};
