import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Diagnosis {
  id: string;
  visit_id: string;
  icd10_code: string;
  description: string | null;
  diagnosis_type: string | null;
  created_at: string;
}

export interface CreateDiagnosisInput {
  visit_id: string;
  icd10_code: string;
  description?: string;
  diagnosis_type?: string;
}

export const useDiagnoses = (visitId?: string) => {
  return useQuery({
    queryKey: ['diagnoses', visitId],
    queryFn: async () => {
      let query = supabase.from('diagnoses').select('*');
      
      if (visitId) {
        query = query.eq('visit_id', visitId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Diagnosis[];
    },
    enabled: visitId ? !!visitId : true
  });
};

export const useCreateDiagnosis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDiagnosisInput) => {
      const { data, error } = await supabase
        .from('diagnoses')
        .insert({
          visit_id: input.visit_id,
          icd10_code: input.icd10_code,
          description: input.description || null,
          diagnosis_type: input.diagnosis_type || 'primary'
        })
        .select()
        .single();

      if (error) throw error;
      return data as Diagnosis;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses', variables.visit_id] });
      toast.success('บันทึกการวินิจฉัยสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};

export const useDeleteDiagnosis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, visitId }: { id: string; visitId: string }) => {
      const { error } = await supabase
        .from('diagnoses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, visitId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses', variables.visitId] });
      toast.success('ลบการวินิจฉัยสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};
