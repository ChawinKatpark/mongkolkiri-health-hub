import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PatientDiagnosis {
  id: string;
  patient_id: string;
  diagnosis_date: string;
  icd10_code: string;
  description: string | null;
  diagnosis_type: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface CreatePatientDiagnosisInput {
  patient_id: string;
  diagnosis_date: string;
  icd10_code: string;
  description?: string;
  diagnosis_type?: string;
  notes?: string;
  created_by?: string;
}

export function usePatientDiagnoses(patientId: string) {
  return useQuery({
    queryKey: ['patient-diagnoses', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_diagnoses')
        .select('*')
        .eq('patient_id', patientId)
        .order('diagnosis_date', { ascending: false });
      
      if (error) throw error;
      return data as PatientDiagnosis[];
    },
    enabled: !!patientId,
  });
}

export function useCreatePatientDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePatientDiagnosisInput) => {
      const { data, error } = await supabase
        .from('patient_diagnoses')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-diagnoses', data.patient_id] });
      toast({
        title: 'บันทึกการวินิจฉัยสำเร็จ',
        description: 'เพิ่มข้อมูลการวินิจฉัยใหม่เรียบร้อยแล้ว',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePatientDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase
        .from('patient_diagnoses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-diagnoses', data.patientId] });
      toast({
        title: 'ลบการวินิจฉัยสำเร็จ',
        description: 'ลบข้อมูลการวินิจฉัยเรียบร้อยแล้ว',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
