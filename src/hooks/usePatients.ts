import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Patient {
  id: string;
  hn: string;
  national_id: string | null;
  first_name: string;
  last_name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  allergies: string[];
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientInput {
  national_id?: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  allergies?: string[];
  phone?: string;
  address?: string;
}

export const usePatients = () => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Patient[];
    }
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Patient | null;
    },
    enabled: !!id
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePatientInput) => {
      // Generate HN
      const { data: hnData, error: hnError } = await supabase.rpc('generate_hn');
      if (hnError) throw hnError;

      const { data, error } = await supabase
        .from('patients')
        .insert({
          hn: hnData,
          national_id: input.national_id || null,
          first_name: input.first_name,
          last_name: input.last_name,
          dob: input.dob,
          gender: input.gender,
          allergies: input.allergies || [],
          phone: input.phone || null,
          address: input.address || null
        })
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('ลงทะเบียนผู้ป่วยสำเร็จ');
    },
    onError: (error: Error) => {
      if (error.message.includes('row-level security') || error.message.includes('violates')) {
        toast.error('ไม่มีสิทธิ์ลงทะเบียนผู้ป่วย', {
          description: 'บัญชีนี้ยังไม่ได้รับสิทธิ์เจ้าหน้าที่ กรุณาติดต่อผู้ดูแลระบบ',
        });
      } else {
        toast.error('เกิดข้อผิดพลาด', { description: error.message });
      }
    }
  });
};
