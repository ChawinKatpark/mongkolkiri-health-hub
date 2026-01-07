import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PatientAccount {
  id: string;
  user_id: string;
  patient_id: string;
  created_at: string;
}

export const usePatientAccount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patient-account', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('patient_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as PatientAccount | null;
    },
    enabled: !!user
  });
};

export const useLinkPatientAccount = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ hn, nationalId }: { hn: string; nationalId: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Find patient by HN and national ID
      const { data: patient, error: findError } = await supabase
        .from('patients')
        .select('id, hn, national_id')
        .eq('hn', hn.toUpperCase())
        .maybeSingle();

      if (findError) throw findError;
      if (!patient) throw new Error('ไม่พบข้อมูลผู้ป่วย กรุณาตรวจสอบหมายเลข HN');

      // Verify national ID matches
      if (patient.national_id !== nationalId) {
        throw new Error('เลขบัตรประชาชนไม่ตรงกับข้อมูลในระบบ');
      }

      // Check if patient is already linked
      const { data: existingLink } = await supabase
        .from('patient_accounts')
        .select('id')
        .eq('patient_id', patient.id)
        .maybeSingle();

      if (existingLink) {
        throw new Error('ข้อมูลผู้ป่วยนี้ถูกเชื่อมโยงกับบัญชีอื่นแล้ว');
      }

      // Create patient account link
      const { data, error } = await supabase
        .from('patient_accounts')
        .insert({
          user_id: user.id,
          patient_id: patient.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as PatientAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-account'] });
      toast.success('เชื่อมโยงบัญชีสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};
