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
    mutationFn: async ({ nationalId }: { nationalId: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Use secure RPC function to verify patient by national ID only
      const { data: patientId, error: verifyError } = await supabase
        .rpc('verify_patient_by_national_id', {
          p_national_id: nationalId
        });

      if (verifyError) {
        // Extract error message from Postgres exception
        throw new Error(verifyError.message);
      }

      if (!patientId) {
        throw new Error('ไม่พบข้อมูลผู้ป่วย กรุณาตรวจสอบเลขบัตรประชาชน');
      }

      // Create patient account link
      const { data, error } = await supabase
        .from('patient_accounts')
        .insert({
          user_id: user.id,
          patient_id: patientId
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
