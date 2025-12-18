import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export type VisitStatus = 
  | 'Registered'
  | 'InQueue'
  | 'VitalSigns'
  | 'WaitingForDoctor'
  | 'InConsultation'
  | 'Diagnosing'
  | 'Ordering'
  | 'OrderConfirmed'
  | 'PerformingProcedure'
  | 'ProcedureCompleted'
  | 'AwaitingPayment'
  | 'PaymentProcessed'
  | 'Dispensing'
  | 'Completed';

export interface Visit {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  visit_date: string;
  queue_number: number | null;
  vital_signs: {
    blood_pressure?: string;
    pulse?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  chief_complaint: string | null;
  physical_exam_note: string | null;
  status: VisitStatus;
  created_at: string;
  updated_at: string;
  patients?: {
    id: string;
    hn: string;
    first_name: string;
    last_name: string;
    dob: string;
    allergies: string[];
  };
}

export const useVisits = (date?: string, statuses?: VisitStatus[]) => {
  return useQuery({
    queryKey: ['visits', date, statuses],
    queryFn: async () => {
      let query = supabase
        .from('visits')
        .select(`
          *,
          patients (
            id, hn, first_name, last_name, dob, allergies
          )
        `)
        .order('queue_number', { ascending: true });

      if (date) {
        query = query.eq('visit_date', date);
      }

      if (statuses && statuses.length > 0) {
        query = query.in('status', statuses);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Visit[];
    }
  });
};

export const useTodayQueue = () => {
  const today = new Date().toISOString().split('T')[0];
  const queryClient = useQueryClient();

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('visits-queue')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visits'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['visits', today] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, today]);

  return useVisits(today);
};

export const useCreateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get next queue number
      const { data: maxQueue } = await supabase
        .from('visits')
        .select('queue_number')
        .eq('visit_date', today)
        .order('queue_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextQueue = (maxQueue?.queue_number || 0) + 1;

      const { data, error } = await supabase
        .from('visits')
        .insert({
          patient_id: patientId,
          visit_date: today,
          queue_number: nextQueue,
          status: 'InQueue'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success('เพิ่มคิวสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};

export const useUpdateVisitStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, status }: { visitId: string; status: VisitStatus }) => {
      const { data, error } = await supabase
        .from('visits')
        .update({ status })
        .eq('id', visitId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success('อัพเดทสถานะสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาด', { description: error.message });
    }
  });
};

export const statusLabels: Record<VisitStatus, string> = {
  Registered: 'ลงทะเบียนแล้ว',
  InQueue: 'รอคิว',
  VitalSigns: 'วัดสัญญาณชีพ',
  WaitingForDoctor: 'รอพบแพทย์',
  InConsultation: 'พบแพทย์',
  Diagnosing: 'วินิจฉัย',
  Ordering: 'สั่งการรักษา',
  OrderConfirmed: 'ยืนยันการสั่ง',
  PerformingProcedure: 'ทำหัตถการ',
  ProcedureCompleted: 'หัตถการเสร็จ',
  AwaitingPayment: 'รอชำระเงิน',
  PaymentProcessed: 'ชำระเงินแล้ว',
  Dispensing: 'จ่ายยา',
  Completed: 'เสร็จสิ้น'
};
